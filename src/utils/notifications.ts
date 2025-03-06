
export function showNotification(msg: string) {
    if (!Notification){
        console.log("Notifications not available");
        return;
    }
    if (Notification.permission === "granted"){
        new Notification(msg);
    }else if (Notification.permission !== "denied"){
        Notification.requestPermission().then((permission) => {
            // If the user accepts, let's create a notification
            new Notification(msg);
          });
    }
}