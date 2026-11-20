const user = {
  name: "juan",
  location: {
    country: "argentina",
    data: {
      zipcode: 213,
    },
  },
};

user.location.data.zipcode;

const users = [
  {
    name: "juan",
    location: {
      country: "argentina",
      data: {
        zipcode: 213,
      },
    },
  },
  {
    name: "juan",
    location: {
      country: "argentina",
      data: {},
    },
  },
];

users.map((u) => user.location.data.zipcode);

// verificar
users.map((u) => user?.location?.data?.zipcode || "mensaje"); //undefined

users.map((u) => user.location.data.zipcode || "mensaje"); //

users.map(
  (u) =>
    (user &&
      user.location &&
      user.location.data &&
      user.location.data.zipcode) ||
    "mensaje",
);


const mostrarData = (parametro_1, parametro_2) => {

}

const name = "Rick%20%26%20Morty";
const url = `https://rickandmortyapi.com/api/character/?name=Rick%20%26%20Morty`;