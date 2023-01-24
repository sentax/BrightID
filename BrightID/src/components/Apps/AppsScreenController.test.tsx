import * as React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@/utils/test-utils';
import AppsScreenController from '@/components/Apps/AppsScreenController';
import { addLinkedContext, setApps } from '@/reducer/appsSlice';
import { setupStore } from '@/store';

describe('AppsScreen', () => {
  let store: AppStore;

  const sponsoringApp = {
    id: 'sponsoringApp',
    name: 'sponsoringApp',
    context: 'testContext',
    verifications: ['BrightID'],
    logo: 'data:image/png;base64,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',
    url: 'https://brightid.org',
    assignedSponsorships: 33167,
    unusedSponsorships: 4451,
    testing: false,
    idsAsHex: false,
    usingBlindSig: false,
    verificationExpirationLength: 0,
    sponsorPublicKey: 'D2BfstFLgILdH8Q3taY0Jl8yVuWejVR9cJSgm8OwQwo=',
    nodeUrl: '',
    soulbound: false,
    callbackUrl: '',
    sponsoring: true,
    verificationUrl: '',
  };
  const notSponsoringApp = {
    ...sponsoringApp,
    id: 'notSponsoringApp',
    name: 'notSponsoringApp',
    context: 'notSponsoringContext',
    sponsoring: false,
  };
  const allApps = [sponsoringApp, notSponsoringApp];

  beforeEach(() => {
    store = setupStore();
    act(() => {
      store.dispatch(setApps(allApps));
    });
  });

  it('shows total number of apps', () => {
    renderWithProviders(<AppsScreenController />, { store });
    expect(screen.getByTestId('totalAppsCount')).toHaveTextContent(
      `${allApps.length} apps`,
    );
  });

  it('shows number of linked apps', () => {
    renderWithProviders(<AppsScreenController />, { store });
    expect(screen.getByTestId('linkedAppsCount')).toHaveTextContent('0 apps');

    // mark v5 app as linked
    act(() => {
      store.dispatch(
        addLinkedContext({
          context: sponsoringApp.context,
          contextId: 'someContextId',
          state: 'applied',
          dateAdded: Date.now(),
        }),
      );
    });
    expect(screen.getByTestId('linkedAppsCount')).toHaveTextContent('1 apps');
  });

  it('filters apps by "linked" state', async () => {
    renderWithProviders(<AppsScreenController />, { store });

    // filter on "Linked"
    fireEvent.press(screen.getByText('Linked'));

    // no app should be visible
    for (const app of allApps) {
      expect(screen.queryByText(app.name)).toBeNull();
    }

    // mark one app as linked
    act(() => {
      store.dispatch(
        addLinkedContext({
          context: sponsoringApp.context,
          contextId: 'someContextId',
          state: 'applied',
          dateAdded: 123456,
        }),
      );
    });

    // only linked app should be listed
    screen.getByText(sponsoringApp.name);
    expect(screen.queryByText(notSponsoringApp.name)).toBeNull();

    // mark second app as linked
    act(() => {
      store.dispatch(
        addLinkedContext({
          context: notSponsoringApp.context,
          contextId: 'someOtherContextId',
          state: 'applied',
          dateAdded: 123456,
        }),
      );
    });

    // both apps should be listed now
    screen.getByText(sponsoringApp.name);
    screen.getByText(notSponsoringApp.name);
  });

  it('filters apps by "sponsoring" state', () => {
    renderWithProviders(<AppsScreenController />, { store });
    // initially all apps should be listed
    for (const app of allApps) {
      expect(screen.getByText(app.name)).toBeVisible();
    }
    // activate "sponsoring" filter
    fireEvent.press(screen.getByText('Sponsoring'));
    expect(screen.getByText(sponsoringApp.name)).toBeVisible();
    expect(screen.queryByText(notSponsoringApp.name)).toBeNull();
    // activate "all apps"
    fireEvent.press(screen.getByText('All Apps'));
    // all apps should be listed again
    for (const app of allApps) {
      expect(screen.getByText(app.name)).toBeVisible();
    }
  });

  it('filters apps by search string', () => {
    renderWithProviders(<AppsScreenController />, { store });
    // initially all apps should be listed
    for (const app of allApps) {
      expect(screen.getByText(app.name)).toBeVisible();
    }

    fireEvent.changeText(
      screen.getByPlaceholderText('App name'),
      'not matching',
    );
    // no app should be visible
    for (const app of allApps) {
      expect(screen.queryByText(app.name)).toBeNull();
    }

    fireEvent.changeText(
      screen.getByPlaceholderText('App name'),
      'sponsoringApp',
    );
    // both apps should be visible
    for (const app of allApps) {
      screen.queryByText(app.name);
    }

    fireEvent.changeText(
      screen.getByPlaceholderText('App name'),
      'notSponsoring',
    );
    // only matching app should be visible
    screen.getByText(notSponsoringApp.name);
    expect(screen.queryByText(sponsoringApp.name)).toBeNull();
  });

  test.todo('shows number of apps meeting verification criteria');
  test.todo('filters apps by "verified" state');
});