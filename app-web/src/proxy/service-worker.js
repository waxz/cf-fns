/* eslint-disable */
/* tslint:disable */
/*  version 0.0.6 */
const PACKAGE_VERSION = '0.0.8'
const INTEGRITY_CHECKSUM = '00729d72e3b82faf54ca8b9621dbb96f'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

function sendToClient(client, message, transferrables = []) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(event.data.error)
      }

      resolve(event.data)
    }

    client.postMessage(
      message,
      [channel.port2].concat(transferrables.filter(Boolean)),
    )
  })
}
// Resolve the main client for the given event.
// Client that issues a request doesn't necessarily equal the client
// that registered the worker. It's with the latter the worker should
// communicate with during the response resolving phase.
async function resolveMainClient(event) {
  const client = await self.clients.get(event.clientId)

  if (activeClientIds.has(event.clientId)) {
    return client
  }

  if (client?.frameType === 'top-level') {
    return client
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  return allClients
    .filter((client) => {
      // Get only those clients that are currently visible.
      return client.visibilityState === 'visible'
    })
    .find((client) => {
      // Find the client ID that's recorded in the
      // set of clients that have registered the worker.
      return activeClientIds.has(client.id)
    })
}

const cacheName = "zzz-ccc-cccc";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


self.addEventListener("install", e => {
  console.log("[ServiceWorker] - Install");
  // The promise that skipWaiting() returns can be safely ignored.
  console.log("[ServiceWorker] - skipWaiting");
  self.skipWaiting();
  console.log("[ServiceWorker] - skipWaiting");
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log("[ServiceWorker] - Caching app shell");
    // await cache.addAll(filesToCache);
  })());
});


// This code executes in its own worker or thread
self.addEventListener("install", event => {
  console.log("Service worker installed");
});
self.addEventListener("activate", event => {

  console.log("Service worker activated");
});



self.addEventListener('message', async function (event) {
  const clientId = event.source.id;

  console.log(`The client [${clientId}]:[${self.clients}] sent me a message: ${event.data}`);

  event.source.postMessage("Hi client");



  if (!clientId || !self.clients) {
    return
  }

  const client = await self.clients.get(clientId)

  if (!client) {
    return
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  switch (event.data) {
    case 'KEEPALIVE_REQUEST': {
      sendToClient(client, {
        type: 'KEEPALIVE_RESPONSE',
      });
      event.source.postMessage('KEEPALIVE_RESPONSE');
      break
    }
    case 'PURGE_CACHE':{
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        return self.clients.matchAll();
      }).then(clients => {
        clients.forEach(client => client.navigate(client.url));
      });

      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(client, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: {
          packageVersion: PACKAGE_VERSION,
          checksum: INTEGRITY_CHECKSUM,
        },
      })
      break
    }

    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)

      sendToClient(client, {
        type: 'MOCKING_ENABLED',
        payload: {
          client: {
            id: client.id,
            frameType: client.frameType,
          },
        },
      })
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'CLIENT_CLOSED': {
      activeClientIds.delete(clientId)

      const remainingClients = allClients.filter((client) => {
        return client.id !== clientId
      })

      // Unregister itself when there are no more clients
      if (remainingClients.length === 0) {
        self.registration.unregister()
      }

      break
    }
  }
})




async function cacheThenNetwork(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log("Found response in cache:", cachedResponse);
    return cachedResponse;
  }
  const url = new URL(request.url);
  console.log("Falling back to network");
  return fetch(request);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  console.log(`Handling request: ${url}`);

  const host= `${url.protocol}//${url.hostname}`;




  if (url.pathname.startsWith("/proxy/http")) {
    // const url_in_pathname = url.pathname.slice(7,url.pathname.length-1 );
    // const url_in_host = `{host}/proxy/${url_in_pathname}`;
    // console.log(`Handling url_in_pathname: ${url_in_pathname}`);
    // const new_req = new Request(
    // );
    // event.respondWith(new Response(`<h1>Mock Example Page for ${url.pathname} </h1>`, {
    //   headers: { "Content-Type": "text/html" }
    // }));
    event.respondWith(cacheThenNetwork(request));

  } else {
    event.respondWith(cacheThenNetwork(request));
  }
});
