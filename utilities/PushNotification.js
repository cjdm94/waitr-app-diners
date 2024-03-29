import { Permissions, Notifications } from 'expo';
import { store } from '../store';
import { setPushNotificationToken } from '../actions';

async function init() {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    return;
  }

  // Get the token that uniquely identifies this device (try state first - we persist it)
  const tokenState = store.getState().pushNotification.token || null;
  if(tokenState === null) {
    let token = await Notifications.getExpoPushTokenAsync();
    store.dispatch( setPushNotificationToken(token) );
  }
}

const send = (token, title, body) => {
  return fetch('https://exp.host/--/api/v2/push/send', {
    body: JSON.stringify({
      to: token,
      title: title,
      body: body,
      data: { message: `${title} - ${body}` },
      sound: 'default'
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
}

export default {
  init, send
};