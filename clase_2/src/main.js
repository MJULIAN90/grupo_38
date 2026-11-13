// import { router } from './router.js';
// import { setupLinkInterception } from './navigation.js';

// setupLinkInterception();

// window.addEventListener('popstate', () => {
//   console.log('popstate disparado');
//   router();
// });

// router(); // render inicial — sin esto, los deep links no funcionan

let myName = "julian";

// console.log('el nombre es ' + myName);
// console.log(`el nombre es ${myName}`);

// console.log({myName});
// console.log('el nombre es ', myName);

let user = {
  name: "julian",
  lastName: "ruiz",
};

// console.log("el user es " + JSON.stringify(user)); // si -
// console.log(`el user es ${JSON.stringify(user)}`); //

// console.log({ user });
// console.log("el user es ", user);

let users = [
  {
    name: "julian",
    lastName: "ruiz",
    data: {
      address: "adfasfasfdfasd",
      country: "argentina",
    },
  },
  {
    name: "juan",
    lastName: "perez",
    data: {
      address: "casasl fasd",
      country: "colombia",
    },
  },
];

const mostrarNombres = (lista, propiedad) => {
  // metodos de iteracion
  // map, find, forEach, sort, filter
  // map, forEach,

  return lista.map((user) => {
    return user.data[propiedad];
  });

  // return implicito
  //   return lista.map(user => user.name);
};

console.log(mostrarNombres(users, "address"));
console.log(mostrarNombres(users, "country"));
