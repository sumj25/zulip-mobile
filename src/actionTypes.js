/* @flow strict-local */
import { ensureUnreachable } from './generics';
import {
  REHYDRATE,
  APP_ONLINE,
  DEAD_QUEUE,
  APP_ORIENTATION,
  DEBUG_FLAG_TOGGLE,
  ACCOUNT_SWITCH,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
  DISMISS_SERVER_PUSH_SETUP_NOTICE,
  GOT_PUSH_TOKEN,
  UNACK_PUSH_TOKEN,
  ACK_PUSH_TOKEN,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
  REGISTER_START,
  REGISTER_ABORT,
  REGISTER_COMPLETE,
  SET_GLOBAL_SETTINGS,
  DRAFT_UPDATE,
  PRESENCE_RESPONSE,
  MESSAGE_SEND_START,
  MESSAGE_SEND_COMPLETE,
  DELETE_OUTBOX_MESSAGE,
  TOGGLE_OUTBOX_SENDING,
  EVENT_MESSAGE_DELETE,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
  EVENT_USER_STATUS_UPDATE,
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  EVENT_NEW_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_PRESENCE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  CLEAR_TYPING,
  EVENT_ALERT_WORDS,
  INIT_TOPICS,
  EVENT_MUTED_TOPICS,
  EVENT_MUTED_USERS,
  EVENT_REALM_FILTERS,
  EVENT_USER_REMOVE,
  EVENT_USER_UPDATE,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_SUBMESSAGE,
  EVENT_SUBSCRIPTION,
  EVENT,
  DISMISS_SERVER_COMPAT_NOTICE,
} from './actionConstants';

import type {
  MessageEvent,
  MutedUsersEvent,
  PresenceEvent,
  StreamEvent,
  RealmUpdateEvent,
  RealmUpdateDictEvent,
  SubmessageEvent,
  RestartEvent,
} from './api/eventTypes';

import type {
  Orientation,
  GlobalState,
  Message,
  MessagesState,
  Outbox,
  Narrow,
  Reaction,
  Identity,
  User,
  UserGroup,
  InitialData,
  RealmFilter,
  Subscription,
  Topic,
  PresenceState,
  RealmEmojiById,
  GlobalSettingsState,
  CaughtUpState,
  MuteState,
  AlertWordsState,
  UserId,
  UserStatusEvent,
} from './types';

/**
 * Dispatched by redux-persist when the stored state is loaded.
 *
 * It can be very convenient to pass `payload` to selectors, but beware it's
 * incomplete.  At a minimum, reducers should always separately handle the
 * case where the state is empty or has `null` properties before passing the
 * object to any selector.
 *
 * @prop payload A version of the global Redux state, as persisted by the
 *     app's previous runs.  This will be empty on first startup or if the
 *     persisted state is just missing keys, and will have `null` at each
 *     key where an error was encountered in reading the persisted state.
 *     In any case it will only contain the keys we configure to be persisted.
 */
type RehydrateAction = $ReadOnly<{|
  type: typeof REHYDRATE,
  +payload: $ReadOnly<$ObjMap<$Rest<GlobalState, { ... }>, <V>(V) => V | null>> | void,
|}>;

type AppOnlineAction = $ReadOnly<{|
  type: typeof APP_ONLINE,
  isOnline: boolean | null,
|}>;

type DeadQueueAction = $ReadOnly<{|
  type: typeof DEAD_QUEUE,
|}>;

type AppOrientationAction = $ReadOnly<{|
  type: typeof APP_ORIENTATION,
  orientation: Orientation,
|}>;

type DebugFlagToggleAction = $ReadOnly<{|
  type: typeof DEBUG_FLAG_TOGGLE,
  key: string,
  value: boolean,
|}>;

type DismissServerCompatNoticeAction = $ReadOnly<{|
  type: typeof DISMISS_SERVER_COMPAT_NOTICE,
|}>;

export type AccountSwitchAction = $ReadOnly<{|
  type: typeof ACCOUNT_SWITCH,
  index: number,
|}>;

type AccountRemoveAction = $ReadOnly<{|
  type: typeof ACCOUNT_REMOVE,
  index: number,
|}>;

export type LoginSuccessAction = $ReadOnly<{|
  type: typeof LOGIN_SUCCESS,
  realm: URL,
  email: string,
  apiKey: string,
|}>;

type LogoutAction = $ReadOnly<{|
  type: typeof LOGOUT,
|}>;

type DismissServerPushSetupNoticeAction = $ReadOnly<{|
  type: typeof DISMISS_SERVER_PUSH_SETUP_NOTICE,
  date: Date,
|}>;

/** We learned the device token from the system.  See `SessionState`. */
type GotPushTokenAction = $ReadOnly<{|
  type: typeof GOT_PUSH_TOKEN,
  pushToken: null | string,
|}>;

/** We're about to tell the server to forget our device token. */
type UnackPushTokenAction = $ReadOnly<{|
  type: typeof UNACK_PUSH_TOKEN,
  identity: Identity,
|}>;

/** The server acknowledged our device token. */
type AckPushTokenAction = $ReadOnly<{|
  type: typeof ACK_PUSH_TOKEN,
  identity: Identity,
  pushToken: string,
|}>;

export type MessageFetchStartAction = $ReadOnly<{|
  type: typeof MESSAGE_FETCH_START,
  narrow: Narrow,
  numBefore: number,
  numAfter: number,
|}>;

/**
 * Any unexpected failure in a message fetch.
 *
 * Includes request timeout errors and any errors we throw when
 * validating and reshaping the server data at the edge.
 *
 * In an ideal crunchy-shell world [1], none of these will be thrown
 * from our Redux reducers: as part of the "soft center" of the app,
 * the data should already be valid at that point. We're not yet in
 * that world, so, we take care to catch those errors and dispatch
 * this action there too. See discussion [2] for implementation notes.
 *
 * [1] https://github.com/zulip/zulip-mobile/blob/main/docs/architecture/crunchy-shell.md
 * [2] https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/.23M4156.20Message.20List.20placeholders/near/937480
 */
type MessageFetchErrorAction = $ReadOnly<{|
  type: typeof MESSAGE_FETCH_ERROR,
  narrow: Narrow,
  // Before storing this in state, be sure to replace/revive Error
  // instances so they aren't coerced into plain objects; see
  // bfe794955 for an example.
  error: Error,
|}>;

export type MessageFetchCompleteAction = $ReadOnly<{|
  type: typeof MESSAGE_FETCH_COMPLETE,
  messages: $ReadOnlyArray<Message>,
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  foundNewest: boolean,
  foundOldest: boolean,
  ownUserId: UserId,
|}>;

type RegisterStartAction = $ReadOnly<{|
  type: typeof REGISTER_START,
|}>;

export type RegisterAbortReason = 'server' | 'network' | 'timeout' | 'unexpected';

/**
 * Notify Redux that we've given up on the initial fetch.
 *
 * Not for unrecoverable errors, like ApiErrors, which indicate that we
 * tried and failed, not that we gave up trying.
 */
type RegisterAbortAction = $ReadOnly<{|
  type: typeof REGISTER_ABORT,
  reason: RegisterAbortReason,
|}>;

export type RegisterCompleteAction = $ReadOnly<{|
  type: typeof REGISTER_COMPLETE,
  data: InitialData,
|}>;

type ServerEvent = $ReadOnly<{|
  id: number,
|}>;

type EventAlertWordsAction = $ReadOnly<{|
  type: typeof EVENT_ALERT_WORDS,
  alertWords: AlertWordsState,
|}>;

type EventRealmFiltersAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_REALM_FILTERS,
  realm_filters: $ReadOnlyArray<RealmFilter>,
|}>;

type EventUpdateGlobalNotificationsSettingsAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  notification_name:
    | 'enable_offline_push_notifications'
    | 'enable_online_push_notifications'
    | 'enable_stream_push_notifications',
  setting: boolean,
|}>;

type EventSubscriptionAddAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'add',
  subscriptions: $ReadOnlyArray<Subscription>,
|}>;

type EventSubscriptionRemoveAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'remove',
  subscriptions: $ReadOnlyArray<{| +stream_id: number, +name: string |}>,
|}>;

type EventSubscriptionUpdateAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'update',
  stream_id: number,
  property: string,
  value: boolean | number | string,

  // TODO(server-4.0): Delete these commented-out properties.
  // name: string, // exists pre-4.0, but expected to be removed soon
  // email: string, // gone in 4.0; was the user's own email, so never useful
|}>;

type EventSubscriptionPeerAddAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'peer_add',
  subscriptions: $ReadOnlyArray<string>,
  user_id: UserId,
|}>;

type EventSubscriptionPeerRemoveAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_SUBSCRIPTION,
  op: 'peer_remove',
  subscriptions: $ReadOnlyArray<string>,
  user_id: UserId,
|}>;

type GenericEventAction = $ReadOnly<{|
  type: typeof EVENT,
  event: StreamEvent | RestartEvent | RealmUpdateEvent | RealmUpdateDictEvent,
|}>;

type EventNewMessageAction = $ReadOnly<{|
  ...$Diff<MessageEvent, {| flags: mixed |}>,
  type: typeof EVENT_NEW_MESSAGE,
  caughtUp: CaughtUpState,
  ownUserId: UserId,
|}>;

type EventSubmessageAction = $ReadOnly<{|
  ...SubmessageEvent,
  type: typeof EVENT_SUBMESSAGE,
|}>;

type EventMessageDeleteAction = $ReadOnly<{|
  type: typeof EVENT_MESSAGE_DELETE,
  messageIds: $ReadOnlyArray<number>,
|}>;

// This is current to feature level 109:
//   https://zulip.com/api/get-events#update_message
type EventUpdateMessageAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_MESSAGE,

  // Future servers might send `null` here:
  //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/.60update_message.60.20event/near/1309241
  // TODO(server-5.0): Update this and/or simplify.
  user_id?: UserId | null,

  // Any content changes apply to just message_id.
  message_id: number,

  // Any stream/topic changes apply to all of message_ids, which is
  //   guaranteed to include message_id.
  message_ids: $ReadOnlyArray<number>,

  flags: $ReadOnlyArray<string>,
  edit_timestamp?: number,
  stream_name?: string,
  stream_id?: number,
  new_stream_id?: number,
  propagate_mode?: 'change_one' | 'change_later' | 'change_all',
  orig_subject?: string,
  subject?: string,

  // TODO(server-4.0): Changed in feat. 46 to array-of-objects shape, from $ReadOnlyArray<string>
  topic_links?: $ReadOnlyArray<{| +text: string, +url: string |}> | $ReadOnlyArray<string>,

  // TODO(server-3.0): Replaced in feat. 1 by topic_links
  subject_links?: $ReadOnlyArray<string>,

  orig_content?: string,
  orig_rendered_content?: string,
  prev_rendered_content_version?: number,
  content?: string,
  rendered_content?: string,
  is_me_message?: boolean,
|}>;

type EventReactionCommon = $ReadOnly<{|
  ...ServerEvent,
  ...$Exact<Reaction>,
  message_id: number,
|}>;

type EventReactionAddAction = $ReadOnly<{|
  ...ServerEvent,
  ...EventReactionCommon,
  type: typeof EVENT_REACTION_ADD,
|}>;

type EventReactionRemoveAction = $ReadOnly<{|
  ...ServerEvent,
  ...EventReactionCommon,
  type: typeof EVENT_REACTION_REMOVE,
|}>;

type EventPresenceAction = $ReadOnly<{|
  ...PresenceEvent,
  type: typeof EVENT_PRESENCE,
|}>;

type EventTypingCommon = $ReadOnly<{|
  ...ServerEvent,
  ownUserId: UserId,
  recipients: $ReadOnlyArray<{| +user_id: UserId, +email: string |}>,
  sender: {| +user_id: UserId, +email: string |},
  time: number,
|}>;

type EventTypingStartAction = $ReadOnly<{|
  ...EventTypingCommon,
  type: typeof EVENT_TYPING_START,
  op: 'start',
|}>;

type EventTypingStopAction = $ReadOnly<{|
  ...EventTypingCommon,
  type: typeof EVENT_TYPING_STOP,
  op: 'stop',
|}>;

type EventUpdateMessageFlagsAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_MESSAGE_FLAGS,
  all: boolean,
  allMessages: MessagesState,
  flag: string,
  messages: $ReadOnlyArray<number>,
  op: 'add' | 'remove',
|}>;

type EventUserAddAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_USER_ADD,
  person: User,
|}>;

type EventUserRemoveAction = $ReadOnly<{|
  type: typeof EVENT_USER_REMOVE,
  // In reality there's more -- but this will prevent accidentally using
  // the type before going and adding those other properties here properly.
|}>;

type EventUserUpdateAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_USER_UPDATE,
  userId: UserId,
  // Include only the fields that should be overwritten.
  person: $Shape<User>,
|}>;

type EventMutedTopicsAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_MUTED_TOPICS,
  muted_topics: MuteState,
|}>;

type EventMutedUsersAction = $ReadOnly<{|
  ...MutedUsersEvent,
  type: typeof EVENT_MUTED_USERS,
|}>;

type EventUserGroupAddAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_ADD,
  op: 'add',
  group: UserGroup,
|}>;

type EventUserGroupRemoveAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_REMOVE,
  op: 'remove',
  group_id: number,
|}>;

type EventUserGroupUpdateAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_UPDATE,
  op: 'update',
  group_id: number,
  data: {| +description?: string, +name?: string |},
|}>;

type EventUserGroupAddMembersAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_ADD_MEMBERS,
  op: 'add_members',
  group_id: number,
  user_ids: $ReadOnlyArray<UserId>,
|}>;

type EventUserGroupRemoveMembersAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_USER_GROUP_REMOVE_MEMBERS,
  op: 'remove_members',
  group_id: number,
  user_ids: $ReadOnlyArray<UserId>,
|}>;

type EventRealmEmojiUpdateAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_REALM_EMOJI_UPDATE,
  realm_emoji: RealmEmojiById,
|}>;

type EventUpdateDisplaySettingsAction = $ReadOnly<{|
  ...ServerEvent,
  type: typeof EVENT_UPDATE_DISPLAY_SETTINGS,
  setting_name: string,
  /** In reality, this can be a variety of types. It's boolean for a
   * `setting_name` of `twenty_four_hour_time`, which is the only case we
   * currently look at. */
  setting: boolean,
|}>;

type EventReactionAction = EventReactionAddAction | EventReactionRemoveAction;

type EventUserStatusUpdateAction = $ReadOnly<{|
  ...UserStatusEvent,
  type: typeof EVENT_USER_STATUS_UPDATE,
|}>;

type EventSubscriptionAction =
  | EventSubscriptionAddAction
  | EventSubscriptionRemoveAction
  | EventSubscriptionUpdateAction
  | EventSubscriptionPeerAddAction
  | EventSubscriptionPeerRemoveAction;

type EventTypingAction = EventTypingStartAction | EventTypingStopAction;

type EventUserAction = EventUserAddAction | EventUserRemoveAction | EventUserUpdateAction;

type EventUserGroupAction =
  | EventUserGroupAddAction
  | EventUserGroupRemoveAction
  | EventUserGroupUpdateAction
  | EventUserGroupAddMembersAction
  | EventUserGroupRemoveMembersAction;

/** Covers all actions we make from server events. */
export type EventAction =
  | GenericEventAction
  // Specific actions.
  | EventAlertWordsAction
  | EventMessageDeleteAction
  | EventMutedTopicsAction
  | EventMutedUsersAction
  | EventNewMessageAction
  | EventSubmessageAction
  | EventPresenceAction
  | EventRealmEmojiUpdateAction
  | EventRealmFiltersAction
  | EventUpdateGlobalNotificationsSettingsAction
  | EventUpdateDisplaySettingsAction
  | EventUpdateMessageAction
  | EventUpdateMessageFlagsAction
  // Unions, found just above.
  | EventReactionAction
  | EventSubscriptionAction
  | EventTypingAction
  | EventUserAction
  | EventUserGroupAction
  | EventUserStatusUpdateAction;

type SetGlobalSettingsAction = $ReadOnly<{|
  type: typeof SET_GLOBAL_SETTINGS,
  update: $Shape<$Exact<GlobalSettingsState>>,
|}>;

type DraftUpdateAction = $ReadOnly<{|
  type: typeof DRAFT_UPDATE,
  narrow: Narrow,
  content: string,
|}>;

type PresenceResponseAction = $ReadOnly<{|
  type: typeof PRESENCE_RESPONSE,
  presence: PresenceState,
  serverTimestamp: number,
|}>;

type MessageSendStartAction = $ReadOnly<{|
  type: typeof MESSAGE_SEND_START,
  outbox: Outbox,
|}>;

type MessageSendCompleteAction = $ReadOnly<{|
  type: typeof MESSAGE_SEND_COMPLETE,
  local_message_id: number,
|}>;

type DeleteOutboxMessageAction = $ReadOnly<{|
  type: typeof DELETE_OUTBOX_MESSAGE,
  local_message_id: number,
|}>;

type ToggleOutboxSendingAction = $ReadOnly<{|
  type: typeof TOGGLE_OUTBOX_SENDING,
  sending: boolean,
|}>;

type ClearTypingAction = $ReadOnly<{|
  type: typeof CLEAR_TYPING,
  outdatedNotifications: $ReadOnlyArray<string>,
|}>;

type InitTopicsAction = $ReadOnly<{|
  type: typeof INIT_TOPICS,
  topics: $ReadOnlyArray<Topic>,
  streamId: number,
|}>;

/* eslint-disable spaced-comment */

////
//
// The `Action` union type, and some subtypes.
//
////

//
// First, some convenience unions without much meaning.
// (We should perhaps just inline these below.)

type AccountAction =
  | AccountSwitchAction
  | AccountRemoveAction
  | LoginSuccessAction
  | LogoutAction
  | DismissServerPushSetupNoticeAction;

type LoadingAction =
  | DeadQueueAction
  | RegisterStartAction
  | RegisterAbortAction
  | RegisterCompleteAction;

type MessageAction = MessageFetchStartAction | MessageFetchErrorAction | MessageFetchCompleteAction;

type OutboxAction = MessageSendStartAction | MessageSendCompleteAction | DeleteOutboxMessageAction;

//
// Then, the primary subtypes of `Action`.  Each of these should have some
// coherent meaning in terms of what kind of state it applies to; and they
// should have no overlap.  (Subtypes that might overlap are formed below
// as unions of these primary subtypes.)

/* eslint-disable semi-style */

/**
 * Plain actions applying to this account's state.
 *
 * That is, these should only be dispatched from a per-account context, and
 * they apply to the account the caller is acting on.  In a pre-#5006 world,
 * that means the active account.
 */
// prettier-ignore
export type PerAccountAction =
  // The grouping here is completely arbitrary; don't worry about it.
  | EventAction
  | LoadingAction
  | MessageAction
  | OutboxAction
  | DraftUpdateAction
  | PresenceResponseAction
  | InitTopicsAction
  | ClearTypingAction
  // state.session
  | DismissServerCompatNoticeAction
  | DismissServerPushSetupNoticeAction
  | ToggleOutboxSendingAction
  ;

/** Plain actions applying to other accounts' per-account state. */
// prettier-ignore
export type AllAccountsAction =
  // This affects all the per-account states as well as everything else.
  | RehydrateAction
  // These can rearrange the `state.accounts` list itself.
  | AccountAction
  // These two are about a specific account… but not just the active one,
  // and they encode which one they mean.
  | AckPushTokenAction | UnackPushTokenAction
  ;

/** Plain actions not affecting any per-account state. */
// prettier-ignore
export type AccountIndependentAction =
  | SetGlobalSettingsAction
  // state.session
  | AppOnlineAction
  | AppOrientationAction
  | GotPushTokenAction
  | DebugFlagToggleAction
  ;

//
// `Action` itself.

/**
 * Covers all plain actions we ever `dispatch`.
 *
 * For *all* actions we ever dispatch, see also the thunk action types in
 * `reduxTypes.js`.
 */
// prettier-ignore
export type Action =
  // This should consist of the primary subtypes defined just above.
  | PerAccountAction
  | AllAccountsAction
  | AccountIndependentAction
  ;

//
// Other subtypes of `Action`.
//
// These should be unions of the primary subtypes, to express different
// meanings about what contexts the actions can be used in.

/** Plain actions that per-account reducers may respond to. */
// prettier-ignore
export type PerAccountApplicableAction =
  | PerAccountAction
  | AllAccountsAction
  ;

// Plain actions that global reducers may respond to are... well, at the
// moment we have no reducers that act only on global state.  Our state
// subtrees `session` and `settings` mix global with per-account state,
// while `accounts` contains per-account state for all accounts, and its
// reducer does respond to some of PerAccountAction as well as
// AllAccountsAction.
// TODO(#5006): Make a GlobalApplicableAction for global session and
//   settings state, once those are separate from per-account.

// TODO(#5006): would be nice to assert these types have empty intersection
// (a: PerAccountApplicableAction & AccountIndependentAction): empty => a; // eslint-disable-line
// (a: GlobalApplicableAction & PerAccountAction): empty => a; // eslint-disable-line

/** Actions that can be dispatched without reference to a specific account. */
// prettier-ignore
export type DispatchableWithoutAccountAction =
  | AllAccountsAction
  | AccountIndependentAction
  ;

/** True just if the action is a PerAccountApplicableAction. */
export function isPerAccountApplicableAction(action: Action): boolean {
  switch (action.type) {
    case EVENT:
    case EVENT_ALERT_WORDS:
    case EVENT_MESSAGE_DELETE:
    case EVENT_MUTED_TOPICS:
    case EVENT_MUTED_USERS:
    case EVENT_NEW_MESSAGE:
    case EVENT_PRESENCE:
    case EVENT_REACTION_ADD:
    case EVENT_REACTION_REMOVE:
    case EVENT_REALM_EMOJI_UPDATE:
    case EVENT_REALM_FILTERS:
    case EVENT_SUBMESSAGE:
    case EVENT_SUBSCRIPTION:
    case EVENT_TYPING_START:
    case EVENT_TYPING_STOP:
    case EVENT_UPDATE_DISPLAY_SETTINGS:
    case EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS:
    case EVENT_UPDATE_MESSAGE:
    case EVENT_UPDATE_MESSAGE_FLAGS:
    case EVENT_USER_ADD:
    case EVENT_USER_GROUP_ADD:
    case EVENT_USER_GROUP_ADD_MEMBERS:
    case EVENT_USER_GROUP_REMOVE:
    case EVENT_USER_GROUP_REMOVE_MEMBERS:
    case EVENT_USER_GROUP_UPDATE:
    case EVENT_USER_REMOVE:
    case EVENT_USER_STATUS_UPDATE:
    case EVENT_USER_UPDATE:
    case DEAD_QUEUE:
    case REGISTER_START:
    case REGISTER_ABORT:
    case REGISTER_COMPLETE:
    case MESSAGE_FETCH_COMPLETE:
    case MESSAGE_FETCH_ERROR:
    case MESSAGE_FETCH_START:
    case MESSAGE_SEND_COMPLETE:
    case MESSAGE_SEND_START:
    case DELETE_OUTBOX_MESSAGE:
    case DRAFT_UPDATE:
    case PRESENCE_RESPONSE:
    case INIT_TOPICS:
    case CLEAR_TYPING:
    case DISMISS_SERVER_COMPAT_NOTICE:
    case DISMISS_SERVER_PUSH_SETUP_NOTICE:
    case TOGGLE_OUTBOX_SENDING:
      (action: PerAccountAction);
      (action: PerAccountApplicableAction);
      return true;

    case REHYDRATE:
    case ACCOUNT_SWITCH:
    case ACCOUNT_REMOVE:
    case LOGIN_SUCCESS:
    case LOGOUT:
    case ACK_PUSH_TOKEN:
    case UNACK_PUSH_TOKEN:
      (action: AllAccountsAction);
      (action: PerAccountApplicableAction);
      return true;

    case SET_GLOBAL_SETTINGS:
    case APP_ONLINE:
    case APP_ORIENTATION:
    case GOT_PUSH_TOKEN:
    case DEBUG_FLAG_TOGGLE:
      (action: AccountIndependentAction);
      return false;

    default:
      ensureUnreachable(action);
      return false;
  }
}
