'use-strict'
const moment = require('moment');
const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const chalk = require('chalk');
const cors = require('cors');
const port = process.env.PORT || 3000;
const jwt = require('jwt-simple');


app.set('jwtTokenSecret', 'ProyectoWeb')
var tokens;

let azucares = JSON.parse(fs.readFileSync('./JSON_Files/azucares.json'));
let carnesACG = JSON.parse(fs.readFileSync('./JSON_Files/carnesAltoContenidoGrasas.json'));
let carnesMCG = JSON.parse(fs.readFileSync('./JSON_Files/carnesMedioContenidoGrasas.json'));
let carnesBCG = JSON.parse(fs.readFileSync('./JSON_Files/carnesBajoContenidoGrasas.json'));
let cereales = JSON.parse(fs.readFileSync('./JSON_Files/cereales.json'));
let frutasACF = JSON.parse(fs.readFileSync('./JSON_Files/frutasAltoContenidoFibra.json'));
let frutasMCF = JSON.parse(fs.readFileSync('./JSON_Files/frutasMedioContenidoFibra.json'));
let frutasBCF = JSON.parse(fs.readFileSync('./JSON_Files/frutasBajoContenidoFibra.json'));
let grasas = JSON.parse(fs.readFileSync('./JSON_Files/grasas.json'));
let jugos = JSON.parse(fs.readFileSync('./JSON_Files/jugos.json'));
let lacteos = JSON.parse(fs.readFileSync('./JSON_Files/lacteos.json'));
let leguminosas = JSON.parse(fs.readFileSync('./JSON_Files/leguminosas.json'));
let libres = JSON.parse(fs.readFileSync('./JSON_Files/libres.json'));
let verdurasGA = JSON.parse(fs.readFileSync('./JSON_Files/verdurasGrupoA.json'));
let verdurasGB = JSON.parse(fs.readFileSync('./JSON_Files/verdurasGrupoB.json'));
let planes = JSON.parse(fs.readFileSync('./JSON_Files/planes.json'));


//Users
let users = JSON.parse(fs.readFileSync('./JSON_Files/users.json'));


let jsonParser = bodyParser.json();

app.listen(port, () => console.log(`App running on port 127.0.0.1:${port}`));


//Middleware to see req
app.use((req, res, next) => {
    console.log("Metodo: " + req.method);
    console.log("URL: " + req.url);
    console.log();
    next();
});


app.use(jsonParser);
app.use(cors());

app.route('/').get((req, res) => res.send("Hola mundo"));
app.route('/home').get((req, res) => console.log("Hola Mundo"));
app.route('/portions').get((req, res) => console.log("Hola Mundo"));
app.route('/plans').get((req, res) => console.log("Hola Mundo"));
app.route('/info').get((req, res) => console.log("Hola Mundo"));
app.route('/aboutUs').get((req, res) => console.log("Hola Mundo"));

/********************************************************************************
 *********************************************************************************
 ************************            Login         *******************************
 *********************************************************************************
 *********************************************************************************
 */

app.route('/api/planes')
    .get((req, res) => res.json(planes))
    .post(auth,(req, res) => {
        console.log(req.body)
        if (req.body.id != undefined && req.body.nombre && req.body.descripcion && req.body.porciones && req.body.esPersonal != undefined) {
            planes.push(req.body);
            fs.writeFileSync('./JSON_Files/planes.json', JSON.stringify(planes))
            console.log(planes);
            res.status(201).send();
            return;
        }
        res.status(400).send({
            error: "Faltan atributos"
        });
    })
app.route('/api/planes/:id')
    .get((req, res) => {
        let id = req.params.id;
        let p = planes.find(pl => pl.id == id);
        if (p) {
            return res.send(p)
        }
        res.send({
            error: 'ID no existe'
        })
    })
    .patch(auth,(req, res) => {
        console.log(req.body)
        let id = req.params.id;
        if (PatchPlan(id, req.body)) {
            return res.send(200)
        }
        res.status(400).send({
            error: "No se encontró ID o faltan datos"
        })
    })
    .delete(auth,(req,res)=>{
        let id = req.params.id;
        let p = planes.findIndex(pl => pl.id == id);
        if (p>=0) {
           planes.splice(p,1);
           fs.writeFileSync('./JSON_Files/planes.json', JSON.stringify(planes))
           return res.status(200).send({
               Notificacion: 'elemento eliminado'
           })
        }
        res.status(400).send({
            error: "No se encontró ID"
        })


    })

function PatchPlan(id, plan) {
    let pos = planes.findIndex(p => p.id == id)
    if (pos >= 0) {
        planes[pos].nombre = (plan.nombre) ? plan.nombre : planes[pos].nombre;
        planes[pos].descripcion = (plan.descripcion) ? plan.descripcion : planes[pos].descripcion;
        planes[pos].porciones = (plan.porciones) ? plan.porciones : planes[pos].porciones;

        fs.writeFileSync('./JSON_Files/planes.json', JSON.stringify(planes))
        return true;

    }
    return false
};


app.post('/api/logup', jsonParser, (req, res) => {

    let newUser = req.body;
    if (typeof newUser.username === 'string' &&
        typeof newUser.edad === 'number' &&
        typeof newUser.password === 'string' &&
        typeof newUser.isAdmin === 'boolean' &&
        typeof newUser.nombre === 'string' &&
        typeof newUser.apellido === 'string'
    ) {
        users.push(newUser);
        //('./JSON_Files/users.json')
        fs.writeFile('./JSON_Files/users.json', JSON.stringify(users));
        console.log(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(406).send('Invalid data');
    }
});

app.post('/api/login/', jsonParser, (req, res) => {
    let usr = req.body;
    let result = false;

    users.forEach(u => {
        if (u.username == usr.username && u.password == usr.password) {
            result = true;
        };
    });

    if (result){
        var expires = moment().add(5, 'minutes').valueOf();
        var token = jwt.encode({
            iss: usr.id,
            exp: expires
        }, app.get('jwtTokenSecret'));
        tokens= { token: token,
            expires: expires,
           usuario: usr}
     res.status(200).json({
        "status": true
    });
}
    else res.status(404).json({
        "status": false
    });
});
app.route(auth,'/api/logout')
        .post((req,res)=>{

          tokens = undefined
          return res.sendStatus(204);



        })

function auth(req,res,next){
        if(tokens!=undefined){
            try{
                if (tokens.expires <= Date.now()) {
                   return res.send('Access token expired', 400);
                }
                next();
            }catch(err){
            res.send('No token', 406);

        }
        } else {
            res.send('No hay token', 406);
        }


}
//Información Nutrimental
app.route('/api/azucares')
    .get((req, res) => res.json(azucares))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            azucares.push(req.body);
            fs.writeFileSync('./JSON_Files/azucares.json', JSON.stringify(azucares))
            console.log(azucares);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/carnesACG')
    .get((req, res) => res.json(carnesACG))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            carnesACG.push(req.body);
            fs.writeFileSync('./JSON_Files/carnesAltoContenidoGrasas.json', JSON.stringify(carnesACG))
            console.log(carnesACG);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/carnesMCG')
    .get((req, res) => res.json(carnesMCG))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            carnesMCG.push(req.body);
            fs.writeFileSync('./JSON_Files/carnesMedioContenidoGrasas.json', JSON.stringify(carnesMCG))
            console.log(carnesMCG);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/carnesBCG')
    .get((req, res) => res.json(carnesBCG))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            carnesBCG.push(req.body);
            fs.writeFileSync('./JSON_Files/carnesBajoContenidoGrasas.json', JSON.stringify(carnesBCG))
            console.log(carnesBCG);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/cereales')
    .get((req, res) => res.json(cereales))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            cereales.push(req.body);
            fs.writeFileSync('./JSON_Files/cereales.json', JSON.stringify(cereales))
            console.log(cereales);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/frutasACF')
    .get((req, res) => res.json(frutasACF))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            frutasACF.push(req.body);
            fs.writeFileSync('./JSON_Files/frutasAltoContenidoFibra.json', JSON.stringify(frutasACF))
            console.log(frutasACF);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/frutasMCF')
    .get((req, res) => res.json(frutasMCF))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            frutasMCF.push(req.body);
            fs.writeFileSync('./JSON_Files/frutasMedioContenidoFibra.json', JSON.stringify(frutasMCF))
            console.log(frutasMCF);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/frutasBCF')
    .get((req, res) => res.json(frutasBCF))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            frutasBCF.push(req.body);
            fs.writeFileSync('./JSON_Files/frutasBajoContenidoFibra.json', JSON.stringify(frutasBCF))
            console.log(frutasBCF);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/grasas')
    .get((req, res) => res.json(grasas))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            grasas.push(req.body);
            fs.writeFileSync('./JSON_Files/grasas.json', JSON.stringify(grasas))
            console.log(grasas);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/jugos')
    .get((req, res) => res.json(jugos))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            jugos.push(req.body);
            fs.writeFileSync('./JSON_Files/jugos.json', JSON.stringify(jugos))
            console.log(jugos);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/lacteos')
    .get((req, res) => res.json(lacteos))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            lacteos.push(req.body);
            fs.writeFileSync('./JSON_Files/lacteos.json', JSON.stringify(lacteos))
            console.log(lacteos);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/leguminosas')
    .get((req, res) => res.json(leguminosas))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            leguminosas.push(req.body);
            fs.writeFileSync('./JSON_Files/leguminosas.json', JSON.stringify(leguminosas))
            console.log(leguminosas);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/libres')
    .get((req, res) => res.json(libres))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            libres.push(req.body);
            fs.writeFileSync('./JSON_Files/libres.json', JSON.stringify(libres))
            console.log(libres);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/verdurasGA')
    .get((req, res) => res.json(verdurasGA))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            verdurasGA.push(req.body);
            fs.writeFileSync('./JSON_Files/verdurasGrupoA.json', JSON.stringify(verdurasGA))
            console.log(verdurasGA);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
app.route('/api/verdurasGB')
    .get((req, res) => res.json(verdurasGB))
    .post((req, res) => {
        console.log(req.body)
        console.log(chalk.blue(JSON.stringify(req.body)));
        console.log(chalk.blue(req.body.id));

        if (req.body.id != undefined && req.body.nombre != undefined && req.body.cantidad != undefined && req.body.porcion != undefined) {
            verdurasGB.push(req.body);
            fs.writeFileSync('./JSON_Files/verdurasGrupoB.json', JSON.stringify(verdurasGB))
            console.log(verdurasGB);
            res.status(201).send();
            return;
        }

        res.status(400).send({
            error: "Faltan atributos"
        });

    });
