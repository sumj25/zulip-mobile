/* @flow strict-local */
import type { GetText, Narrow, MessageListElement } from '../../types';
import { ensureUnreachable } from '../../generics';
import type { BackgroundData } from '../MessageList';

import message from './message';
import header from './header';
import time from './time';

export default ({
  backgroundData,
  narrow,
  messageListElements,
  _,
}: {|
  backgroundData: BackgroundData,
  narrow: Narrow,
  messageListElements: $ReadOnlyArray<MessageListElement>,
  _: GetText,
|}): string =>
  messageListElements
    .map(element => {
      switch (element.type) {
        case 'time':
          return time(element);
        case 'header':
          return header(backgroundData, element);
        case 'message':
          return message(backgroundData, element, _);
        default:
          ensureUnreachable(element);
          throw new Error(`Unidentified element.type: '${element.type}'`);
      }
    })
    .join('');
