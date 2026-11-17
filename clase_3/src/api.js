// export async function fetchJson(url) {
//   try {
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error("Http Error ", response.status);
//     }

//     const data = await response.json();

//     return data;
//     console.log(data);
//   } catch (error) {
//     return `Error in request ${error.message}`;
//   }
// }

export function fetchJson(url) {
  return fetch(url)
    .then((response) => {

        console.log('aca que tiene el response ' , response);
        
      if (!response.ok) {
        throw new Error("Http Error ", response.status);
      }

      console.log('miremos si con error entra aca', response.json());
      
      return response.json();
    })
    .then((data) => data)
    .catch(error => error)
}
