/*
Mostrar todas las marcas de coches que hay en el concesionario
*/
db.coches.distinct("marca")
//--------------------------------------------------------------------------------------------------------------------------------------------
/*
Necesito saber los coches que hayan sido fabricados despues del 2015 (este incluido),
que tengan pantalla tactil y techo solar. Ademas quiero que el coche tenga al menos 140cv,
pero menos de 190cv, y que no sea de la marca Renault.
*/
db.coches.find({
    $and:[
        {extras: { $all: [ /pantalla t.ctil/i , /techo solar/i ] }},
        {fechaFabricacion: {$gte: new Date("2015-01-01")}},
        {"potencia.cv":{$gte:140,$lt:190}},
        {marca:{$not:{$eq:"Renault"}}}
    ]
},
{
    marca:1,
    modelo:1,
    matricula:1,
    kilometros:1,
    extras:1,
    "precioInicial.Eur":1,
    fechaFabricacion:1
}).pretty()
//--------------------------------------------------------------------------------------------------------------------------------------------

/*
Quiero saber el primer extra de los coches que tengan extras y que hayan sido matriculados entre 2015 y 2018
Para saber el ultimo extra deberemos cambiar el $slice a -1
*/
db.coches.find({
    extras: {$exists: true},
    fechaMatriculacion:{$gte: new Date("2015-01-01"), $lte: new Date("2018-01-01")}
},
{
    marca:1,
    modelo:1,
    extras:{$slice:1},
    fechaMatriculacion:1
})


//--------------------------------------------------------------------------------------------------------------------------------------------
/*
Coche no tenga techo solar o frenada automatica, que sea gasolina, de color rojo, 
con al menos 180 caballos y menos de 33000km
*/
db.coches.find({
    $and:[
        {extras: {$nin:[/techo solar/i,/frenada autom.tica/i]}},
        {"motor.combustible": {$eq: "Gasolina"}},
        {color: "rojo"},
        {"potencia.cv":{$gte: 180}},
        {kilometros:{$lte: 33000}}
    ]
},
{
    marca:1,
    modelo:1,
    extras:1,
    "potencia.cv":1,
    kilometros:1,
    "precioInicial.Eur":1
})


//--------------------------------------------------------------------------------------------------------------------------------------------
/*
Tengo un amigo al que le encanta derrapar con el coche. Esta buscando uno que no tenga ABS,
que tenga al menos 190 caballos, y que cueste menos de 8000€, a no ser de que tenga menos de
50000km, en ese caso, puede hasta 13000€
*/

db.coches.find({
    $or:[
        {$and:[
            {abs: false},
            {"potencia.cv":{$gte: 190}},
            {"precioInicial.Eur":{$lt: 8000}}
        ]},
        {$and:[
            {abs: {$ne: true}},
            {"potencia.cv": {$gte: 190}},
            {kilometros: {$lte: 50000}},
            {"precioInicial.Eur":{$lte: 13000}}
        ]}
    ]
}).pretty()

//--------------------------------------------------------------------------------------------------------------------------------------------
/*
Quiero mostrar los nombres de todos los coches que no sean blancos ni que tengan pantalla tactil por
orden de fecha de fabricacion (de mas nuevo a mas antiguo).
*/
db.coches.find({
    $nor: [
        {color: "blanco"},
        {extras: {$elemMatch:{$regex:/pantalla t.ctil/i}}}
    ]},
    {
        marca:1,
        modelo:1,
        color:1,
        extras:1,
        fechaFabricacion:1
    }
    ).sort(
    { 
        fechaFabricacion: -1.0
    }
)
//--------------------------------------------------------------------------------------------------------------------------------------------
/*
Tengo un cliente que quiere un extra que no es muy conocido. Ni el se acuerda de como
se escribe, solo sabe que acaba en "pilot". Busca un coche que coincida.
*/
db.coches.find({
    extras: {$regex:/.?pilot/i}
}).pretty()

//--------------------------------------------------------------------------------------------------------------------------------------------

/*
Mi jefe esta buscando un coche blanco para poner el logo de su empresa. Le da igual el modelo, 
pero quiere que tenga los menos kilometros posibles y que valga menos de 16000€
*/

db.coches.find(
    { 
        color: "blanco",
        "precioInicial.Eur": {$lt: 16000}
    }
).sort(
    { 
        "kilometros" : 1.0
    }
).limit(1);


//--------------------------------------------------------------------------------------------------------------------------------------------
/*
Mi padre quiere comprarse un coche. No quiere gastarse mas de 12000€ pero, si el coche es blanco, puede gastarse 3000€ mas (15000€)
*/

db.coches.find({
    $or:[
        {"precioInicial.Eur": {$lte: 12000}},

        { $and: [
            {color: {$eq: "blanco"}},
            {"precioInicial.Eur": {$lte: 15000}}
        ]}
    ]
},
{
    marca:1,
    modelo:1,
    matricula:1,
    color:1,
    kilometros:1,
    extras:1,
    "precioInicial.Eur":1
}).pretty()

//--------------------------------------------------------------------------------------------------------------------------------------------

/*
Busco un coche con motor TDI que cueste menos de 12000€, aunque si tiene menos de
150000 km y asientos calefactables, puedo pagar hasat 15000€.
*/
db.coches.find({
    $or:[
        {
        "precioInicial.Eur": {$lt: 12000},
        "motor.cilindrada": {$regex: /.?TDI/i}
        },
        {
        "precioInicial.Eur": {$lte: 16000},
        "motor.cilindrada": {$regex: /.?TDI/i},
        extras: {$regex: /asientos calefactables/i},
        kilometros: {$lte: 150000}
        }
    ]
    },
    {
        marca:1,
        modelo:1,
        matricula:1,
        kilometros:1,
        extras:1,
        "precioInicial.Eur":1
}).pretty()


//--------------------------------------------------------------------------------------------------------------------------------------------
/*
Tengo un golf y quiero cambiarle las 4 ruedas por unas Michelin. El problema es que no se
las medidas de mis neumaticos y quiero saber cuanto me costarian en total.
*/
//Extraer medidas
db.coches.find({
    marca: "Volkswagen",
    modelo: "Golf",
    "motor.cilindrada": {$regex: /1.6 TDI/i}
},
{
    _id:0,
    medidasNeumatico:1,
})
//Buscar los neumaticos y multiplicar su precio por 4
db.neumaticos.aggregate([
    {$match:{medidasNeumatico: [ 
        { ancho: 195 }, 
        { perfil: 65 }, 
        { interior: 15 } 
    ],
    marca: "Michelin"}},
    {$project: 
        
        {valor:
            {$multiply:["$precioEur", 4]}
        }
    }
]).pretty()

//--------------------------------------------------------------------------------------------------------------------------------------------

/* 
Me da curiosidad saber cuanto tiempo pasó desde que los coches fueron fabricados,
hasta que los matricularon por primera vez. Muestra todo el tiempo que estuvieron
sin matricular todos los coches de la lista
*/
db.coches.aggregate([
    {$project: 
        {diasDesmatriculado:
            {$divide:[{$subtract:["$fechaMatriculacion", "$fechaFabricacion"]},1000*60*60*24]}
        }
    }
]).pretty()

//--------------------------------------------------------------------------------------------------------------------------------------------

/*
Odio la marca toyota y me encantan los coches con un perfil bajos en los neumaticos.
Busca un coche que no sea toyota y que tenga un perfil de neumatico menor que 50
*/
db.coches.find({
    $and: [
        {marca: {$not:
                    {$eq: "Toyota"}}},
        {medidasNeumatico: 
            {$elemMatch: 
                {perfil: 
                    {$lt: 50},
                }
            }
        }]
},
{
    marca:1,
    modelo:1,
    matricula:1,
    kilometros:1,
    extras:1,
    "precioInicial.Eur":1,
    medidasNeumatico:1
}).pretty()

//--------------------------------------------------------------------------------------------------------------------------------------------
/*
A un cliente le han pinchado 3 ruedas de su coche. Las medidas son 205/60 R16, pero solo quiere
mdelos de 2018 y 2019. Quiere comprobar si hay ofertas de 3x2 para esta busqueda.
*/
db.neumaticos.find({
    modelo: {$in:[new Date("2018-01-01"),new Date("2019-01-01")]},
    medidasNeumatico: [
        { ancho: 205 },
        { perfil: 60 },
        { interior: 16 }
    ],
    oferta: {$in:["3x2"]}
})

//--------------------------------------------------------------------------------------------------------------------------------------------

/*
Necesito mostrar neumaticos que SOLO tengan modelos del 2018 y del 2019 
que valgan menos de 58€ por neumatico. Mostrarlos de menor a mayor precio
*/
db.neumaticos.find({
    $and:[
        {modelo: {$all:[new Date("2019-01-01"), new Date("2020-01-01")]}},
        {precioEur: {$lt:58}}
    ]
}).sort(
    { 
        "precioEur" : 1.0
    }
)

//--------------------------------------------------------------------------------------------------------------------------------------------
/*
Ha llegado un nuevo modelo de neumatico para el neumatico con la _id 7.
Añade el modelo de 2021 para que quede guardado en la base de datos.
*/
/*$
set borra el array y escribe el valor o valores pasados, $addToSet
añade la informacion al array ya existente
*/
db.neumaticos.updateOne(
    {_id: 7},
    {
        $addToSet: {modelo: new Date("2021-01-01")}
    }
)

//comprobar la actualizacion
db.neumaticos.find({_id:7})