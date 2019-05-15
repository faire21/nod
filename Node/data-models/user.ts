import { Plan } from './plan';

export class User {
              // public historial: Historial
   constructor( public id: number,
        public username: string,
        public password: string,
        public edad: number,
        public isAdmin: boolean,
        public nombre: string,
        public apellido: string,
        public pesoEnKG: number,
        public planesPersonales: Plan[],
        public lastIDP: number,
        public planElegido: Plan){
        }
}
