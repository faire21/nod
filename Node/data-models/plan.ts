import { Porcion } from './Porcion';

export class Plan {
    constructor(
        public id: number,
        public esPersonal: boolean,
        public nombre: string, //Max 18 caracteres
        public descripcion: string, //Max 250 caracteres
        public porciones: Porcion[]
        /*
       0 verdura
       1 cereales
       2 leguminosas
       3 lacteos
       4 grasas
       5 frutas
       6 azucares
       7 carnes
        */


    ) { }

/*
   value={{planmodal.porciones[5].cantidad}}
  */






}
