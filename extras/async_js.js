// herramientas para peticiones

fetch('url')

// Js Asincronismo

// callbacks

const mifuncion =  () => {}

mifuncion(() => {
  console.log("¡Han pasado 3 segundos y esto es un callback anónimo!");
}, 3000);


// promesas

fetch('url')
    .then(response => response.json()) // respuesta http
    .then(responseJson => {console.log('response', responseJson);
    }) // aca ya tenemos la respuesta 
    .catch(error => {})

// async - await

async function test () {
    try {
        const response = await fetch('url')
        const responseJson = await response.json()
        console.log(responseJson);
        
    } catch (error) {
        console.log(error);
    }
}

