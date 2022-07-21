import i18next from 'i18next';
import { b64ToUrlSafeB64, hash, urlSafeRandomKey } from '@/utils/encoding';
import {
  SINGLE_CHANNEL_TTL,
  CHANNEL_INFO_NAME,
  MIN_CHANNEL_INFO_VERSION,
  CHANNEL_INFO_VERSION_1,
  CHANNEL_INFO_VERSION_2,
  MAX_CHANNEL_INFO_VERSION,
  channel_states,
  channel_types,
  GROUP_CHANNEL_TTL,
  STAR_CHANNEL_TTL,
  CHANNEL_INFO_VERSION_3,
} from '@/utils/constants';
import ChannelAPI from '@/api/channelService';
import { encryptData } from '@/utils/cryptoHelper';
import { retrieveImage } from '@/utils/filesystem';

export const generateChannelData = async (
  channelType: ChannelType,
  url: URL,
): Promise<Channel> => {
  const aesKey = await urlSafeRandomKey(16);
  const id = await urlSafeRandomKey(9);
  const timestamp = Date.now();
  let ttl;
  switch (channelType) {
    case 'GROUP':
      ttl = GROUP_CHANNEL_TTL;
      break;
    case 'STAR':
      ttl = STAR_CHANNEL_TTL;
      break;
    case 'SINGLE':
    default:
      ttl = SINGLE_CHANNEL_TTL;
      break;
  }
  const myProfileId = await urlSafeRandomKey(9);
  const initiatorProfileId = myProfileId;
  const type = channelType;
  const state = channel_states.OPEN;
  const channelApi = new ChannelAPI(url.href);

  return {
    aesKey,
    api: channelApi,
    id,
    initiatorProfileId,
    myProfileId,
    state,
    timestamp,
    ttl,
    type,
    url,
  };
};

export const createChannelInfo = (channel: Channel) => {
  const obj: ChannelInfo = {
    version: CHANNEL_INFO_VERSION_3,
    type: channel.type,
    timestamp: channel.timestamp,
    initiatorProfileId: channel.initiatorProfileId,
  };
  return obj;
};

export const buildChannelQrUrl = ({ aesKey, id, url }: Channel) => {
  const qrUrl = new URL(url.href);
  qrUrl.searchParams.append('aes', aesKey);
  qrUrl.searchParams.append('id', id);
  return qrUrl;
};

export const parseChannelQrURL = async (url: URL) => {
  // parse and remove aesKey from URL
  const aesKey = url.searchParams.get('aes');
  url.searchParams.delete('aes');
  // parse and remove channelID from URL
  const id = url.searchParams.get('id');
  url.searchParams.delete('id');

  // create channelAPI
  const channelApi = new ChannelAPI(url.href);

  // download channelInfo and remaining TTL
  const { data: channelInfo, newTTL } = await channelApi.download({
    channelId: id,
    dataId: CHANNEL_INFO_NAME,
  });
  console.log(`Got ChannelInfo:`);
  console.log(channelInfo);

  if (channelInfo.version > MAX_CHANNEL_INFO_VERSION) {
    const msg = i18next.t(
      'channel.alert.text.localOutdated',
      'client version outdated - please update your client and retry',
    );
    throw new Error(msg);
  } else if (channelInfo.version < MIN_CHANNEL_INFO_VERSION) {
    const msg = i18next.t(
      'channel.alert.text.otherOutdated',
      'other client version outdated - QRCode creator needs to update client and retry',
    );
    throw new Error(msg);
  }

  const myProfileId = await urlSafeRandomKey(9);

  const channel: Channel = {
    aesKey,
    api: channelApi,
    id,
    initiatorProfileId: channelInfo.initiatorProfileId,
    myProfileId,
    state: channel_states.OPEN,
    timestamp: channelInfo.timestamp,
    ttl: newTTL,
    type: channelInfo.type,
    url,
  };
  return channel;
};

export const uploadConnection = async ({
  conn,
  channelApi,
  aesKey,
  signingKey,
}: {
  conn: Connection;
  channelApi: ChannelAPI;
  aesKey: string;
  signingKey: string;
}) => {
  try {
    const { id, name, photo, timestamp, socialMedia } = conn;
    let photoString = '';

    if (!name) {
      return;
    }

    // retrieve photo
    if (photo?.filename) {
      photoString = await retrieveImage(photo.filename);
    }

    const dataObj: SyncConnection = {
      id,
      photo: photoString,
      name,
      timestamp,
      socialMedia,
    };

    const encrypted = encryptData(dataObj, aesKey);
    console.log(`Posting profile data of ${id} ...`);
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      dataId: `connection_${id}:${b64ToUrlSafeB64(signingKey)}`,
    });
  } catch (err) {
    console.error(`uploadConnection: ${err.message}`);
  }
};

export const uploadGroup = async ({
  group,
  channelApi,
  aesKey,
  signingKey,
}: {
  group: {
    id: string;
    name?: string;
    photo?: Photo;
    aesKey?: string;
    members: Array<string>;
    admins: Array<string>;
  };
  channelApi: ChannelAPI;
  aesKey: string;
  signingKey: string;
}) => {
  try {
    const { id, name, photo, aesKey: groupKey, members, admins } = group;
    let photoString = '';
    if (!groupKey) {
      // not worth uploading group data is missing
      return;
    }
    // retrieve photo
    if (photo?.filename) {
      photoString = await retrieveImage(photo.filename);
    }

    const dataObj = {
      id,
      photo: photoString,
      name,
      aesKey: groupKey,
      members,
      admins,
    };

    const encrypted = encryptData(dataObj, aesKey);
    console.log(`Posting group data of ${id} ...`);
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      dataId: `group_${id}:${b64ToUrlSafeB64(signingKey)}`,
    });
  } catch (err) {
    console.error(`uploadGroup: ${err.message}`);
  }
};

export const uploadBlindSig = async ({
  sig,
  channelApi,
  aesKey,
  signingKey,
  prefix,
}: {
  sig: SigInfo;
  channelApi: ChannelAPI;
  aesKey: string;
  signingKey: string;
  prefix: string;
}) => {
  try {
    const encrypted = encryptData(sig, aesKey);
    console.log(
      `Posting blind sig for app: ${sig.app} verification: ${sig.verification} ...`,
    );
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      // use hash of sig.uid to avoid revealing it
      dataId: `${prefix}blindsig_${hash(sig.uid)}:${b64ToUrlSafeB64(
        signingKey,
      )}`,
    });
  } catch (err) {
    console.error(`uploadBlindSig: ${err.message}`);
  }
};

export const uploadContextInfo = async ({
  contextInfo,
  channelApi,
  aesKey,
  signingKey,
  prefix,
}: {
  contextInfo: ContextInfo;
  channelApi: ChannelAPI;
  aesKey: string;
  signingKey: string;
  prefix: string;
}) => {
  try {
    const encrypted = encryptData(contextInfo, aesKey);
    console.log(
      `Posting ContextInfo: ${contextInfo.context} - ${contextInfo.contextId}...`,
    );
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      dataId: `${prefix}contextInfo_${hash(
        contextInfo.context,
      )}:${b64ToUrlSafeB64(signingKey)}`,
    });
  } catch (err) {
    console.error(`uploadContextInfo: ${err.message}`);
  }
};
