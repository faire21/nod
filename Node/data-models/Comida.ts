import { Porcion } from './Porcion';

export class Comida {
	public id: number;
	public nombre: string;
	public cantidad: number;
	public porciones: Porcion[];

	public constructor(porciones: Porcion[]){
		this.porciones = porciones;
	}

}
