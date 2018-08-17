// @flow

import {
  KEYS_USER_A,
  PAIRING_MESSAGE,
  PUBLICKEY2,
  RESET_STORE_USER_A,
  TIMESTAMP,
  PUBLICKEY3,
  DISPATCHER_USER_A,
  USER_A_WAITING,
  RTC_ID,
} from '../actions';

const schema = {
  ALPHA: {
    OFFER: '',
    ICE_CANDIDATE: '',
    PUBLIC_KEY: '',
  },
  ZETA: {
    ANSWER: '',
    ICE_CANDIDATE: '',
    PUBLIC_KEY: '',
  },
};

export const initialState = {
  publicKey: new Uint8Array(),
  secretKey: new Uint8Array(),
  boxKeypair: {
    publicKey: '',
    secretKey: '',
    nonce: 'wadata',
  },
  message: '',
  messageStr: '',
  publicKey2: new Uint8Array(),
  avatar2: '',
  nameornym2: '',
  timestamp: '',
  signedMsg: '',
  rtcId: '',
  waiting: false,
  dispatcher: schema,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case KEYS_USER_A:
      return {
        ...state,
        publicKey: action.publicKey,
        secretKey: action.secretKey,
      };
    case PUBLICKEY2:
      return {
        ...state,
        publicKey2: new Uint8Array(Object.values(action.publicKey)),
        avatar2: action.avatar,
        nameornym2: action.nameornym,
      };
    case PUBLICKEY3:
      return {
        ...state,
        publicKey3: new Uint8Array(Object.values(action.publicKey)),
      };
    case PAIRING_MESSAGE:
      return {
        ...state,
        message: action.msg,
        messageStr: action.msgStr,
        signedMsg: action.signedMsg,
      };
    case TIMESTAMP:
      return {
        ...state,
        timestamp: action.timestamp,
      };
    case RTC_ID:
      return {
        ...state,
        rtcId: action.rtcId,
      };
    case DISPATCHER_USER_A:
      return {
        ...state,
        dispatcher: action.dispatcher,
        waiting: false,
      };
    case USER_A_WAITING:
      return {
        ...state,
        waiting: true,
      };
    case RESET_STORE_USER_A:
      return {
        ...state,
        message: '',
        messageStr: '',
        signedMsg: '',
        publicKey2: new Uint8Array(),
        publicKey3: new Uint8Array(),
        avatar2: '',
        nameornym2: '',
        timestamp: '',
        rtcId: '',
        dispatcher: schema,
      };
    default:
      return state;
  }
};

export default reducer;
