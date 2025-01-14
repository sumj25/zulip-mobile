/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View, FlatList } from 'react-native';

import type { AccountStatus } from './accountsSelectors';
import { ViewPlaceholder } from '../common';
import AccountItem from './AccountItem';

type Props = $ReadOnly<{|
  accounts: $ReadOnlyArray<AccountStatus>,
  onAccountSelect: number => Promise<void> | void,
  onAccountRemove: number => Promise<void> | void,
|}>;

export default function AccountList(props: Props): Node {
  const { accounts, onAccountSelect, onAccountRemove } = props;

  return (
    <View>
      <FlatList
        data={accounts}
        keyExtractor={item => `${item.email}${item.realm.toString()}`}
        ItemSeparatorComponent={() => <ViewPlaceholder height={8} />}
        renderItem={({ item, index }) => (
          <AccountItem
            index={index}
            account={item}
            onSelect={onAccountSelect}
            onRemove={onAccountRemove}
          />
        )}
      />
    </View>
  );
}
