navigator.serviceWorker.register('src/utils/sw.js');

export function showNotification(msg: string){
    Notification.requestPermission(function(result) {
    if (result === 'granted') {
        navigator.serviceWorker.ready.then(function(registration) {
            registration.showNotification(msg);
        });
    }
    else {
        console.log('Notification permission denied');
    }
    });
}