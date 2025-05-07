import { cacheName } from './config.ts';
            // Do something with cacheName.
            if ('serviceWorker' in navigator) {
    
    
    
    
                //https://github.com/parcel-bundler/parcel/issues/8307
                window.addEventListener('load', () => {
                    const s = navigator.serviceWorker
                    s.register("./es-module-sw.ts", { type: 'module', }).then((registration) => {
                        if (registration.active) {
                            console.log('Service worker is active');
                        }
                    });
    
    
    
                });
    
    
    
            }