/* @flow strict-local */
import React, { useState, useContext, useCallback } from 'react';
import type { Node } from 'react';
import { FlatList, View } from 'react-native';
import { TranslationContext } from '../boot/TranslationProvider';
import { createStyleSheet } from '../styles';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { useSelector } from '../react-redux';
import { Input, SelectableOptionRow, Screen, ZulipButton } from '../common';
import { getAuth, getSelfUserStatusText } from '../selectors';
import { IconCancel, IconDone } from '../common/Icons';
import statusSuggestions from './userStatusTextSuggestions';
import { navigateBack } from '../nav/navActions';
import * as api from '../api';

const styles = createStyleSheet({
  statusTextInput: {
    margin: 16,
  },
  buttonsWrapper: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    margin: 8,
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'user-status'>,
  route: RouteProp<'user-status', void>,
|}>;

export default function UserStatusScreen(props: Props): Node {
  const auth = useSelector(getAuth);
  const userStatusText = useSelector(getSelfUserStatusText);

  const [statusText, setStatusText] = useState<string>(userStatusText);
  const _ = useContext(TranslationContext);

  const sendToServer = useCallback(
    (_statusText: string) => {
      api.updateUserStatus(auth, { status_text: _statusText });
      NavigationService.dispatch(navigateBack());
    },
    [auth],
  );

  const handlePressUpdate = useCallback(() => {
    sendToServer(statusText);
  }, [statusText, sendToServer]);

  const handlePressClear = useCallback(() => {
    setStatusText('');
    sendToServer('');
  }, [sendToServer]);

  return (
    <Screen title="User status">
      <Input
        autoFocus
        maxLength={60}
        style={styles.statusTextInput}
        placeholder="What’s your status?"
        value={statusText}
        onChangeText={setStatusText}
      />
      <FlatList
        data={statusSuggestions}
        keyboardShouldPersistTaps="always"
        keyExtractor={item => item}
        renderItem={({ item, index }) => (
          <SelectableOptionRow
            key={item}
            itemKey={item}
            title={item}
            selected={item === statusText}
            onRequestSelectionChange={itemKey => {
              setStatusText(_(itemKey));
            }}
          />
        )}
      />
      <View style={styles.buttonsWrapper}>
        <ZulipButton
          style={styles.button}
          secondary
          text="Clear"
          onPress={handlePressClear}
          Icon={IconCancel}
        />
        <ZulipButton
          style={styles.button}
          text="Update"
          onPress={handlePressUpdate}
          Icon={IconDone}
        />
      </View>
    </Screen>
  );
}
