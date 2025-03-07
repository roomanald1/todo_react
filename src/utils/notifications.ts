
export function showNotification(msg: string) {


    Notification.requestPermission().then((permission) => {
        if (permission == "granted")
            try{
                new Notification(msg);
            }catch(e){
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(msg);
                  });
            }
        });
}

try{
    navigator.serviceWorker.register("sw.js");
}catch(e){
    console.log(e);
}