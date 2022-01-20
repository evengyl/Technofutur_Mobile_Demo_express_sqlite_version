const express = require("express")
const port = process.env.PORT || 3000
const app = express()
const sqlite3 = require("sqlite3")
const { open } = require("sqlite")

app.use(express.json())
app.use(express.urlencoded({ extended : true}))


//connection db
open({
    filename : "./dbUsers.db",
    driver : sqlite3.Database
})
.then((connection) => {
    console.log("db open")

    /*
    Users
        localhost:3000/api/users/       --> get all users
        localhost:3000/api/users/:id     --> get one user
        localhost:3000/api/users/       --> post one user
        localhost:3000/api/users/:id     --> put / patch one user
        localhost:3000/api/users/:id     --> delete one user

        localhost:3000/api/users/option?name=loic   --> get one user by name
        localhost:3000/api/users/option?login=evengyl   --> get one user by login

        localhost:3000/api/users/name/:name         --> get one user by name
        localhost:3000/api/users/login/:login     --> get one user by login
    */

    /*
    Liste des statuts http important

        200 : succès de la requête ;
        301 et 302 : redirection, respectivement permanente et temporaire ;
        401 : utilisateur non authentifié ;
        403 : accès refusé ;
        404 : page non trouvée ;
        500 et 503 : erreur serveur ;
        504 : le serveur n'a pas répondu.
    */


    //localhost:3000/                  --> page d'accueil
    app.get("/", (req, res) => {
        res.send(`
            <a href="/api/users">Get all de tous les users : localhost:3000/api/users</a>
            <a href="/api/users/1">Get one user by id (1) : localhost:3000/api/users/1</a>
        `)
    })


    //localhost:3000/api/users/       --> get all users
    app.get("/api/users/", (req, res) => {

        connection.all("SELECT * FROM Users")
        .then((datas) => {

            convertStrToArray(datas)
            
            res.json(datas)
        })
        .catch((e) => {
            res.status(500).send("Error DB")
        })
    })


    



    //localhost:3000/api/users/:id     --> get one user
    app.get("/api/users/:id", (req, res, next) => {

        
        if(parseInt(req.params.id, 10))
        {
            let id = parseInt(req.params.id, 10)

            connection.get("SELECT * FROM Users WHERE id = ?", id)
            .then((datas) => {
                
                convertStrToArray(datas)
                res.json(datas)
            })
            .catch((e) => {
                res.status(500).send("Error DB ou, user non trouvé")
            })
        }
        else{
            next()
        }
    })



    //localhost:3000/api/users/option?name=loic   --> get one user by name
    //localhost:3000/api/users/option?login=evengyl   --> get one user by login
    app.get("/api/users/option", (req, res, next) => {

        if(req.query.name && !req.query.login)
        {
            connection.get("SELECT * FROM Users WHERE name = ?", req.query.name)
            .then((datas) => {
                
                convertStrToArray(datas)
                res.json(datas)
            })
            .catch((e) => {
                res.status(500).send("Error DB ou, user non trouvé")
            })
        }
        else if(req.query.login && !req.query.name)
        {
            connection.get("SELECT * FROM Users WHERE login = ?", req.query.login)
            .then((datas) => {
                
                convertStrToArray(datas)
                res.json(datas)
            })
            .catch((e) => {
                res.status(500).send("Error DB ou, user non trouvé")
            })
        }
        else
        {
            next()
        }
    })


    //localhost:3000/api/users/name/:name         --> get one user by name
    //localhost:3000/api/users/login/:login     --> get one user by login
    app.get(["/api/users/name/:name", "/api/users/login/:login"], (req, res, next) => {
        console.log(req.params)

        if(req.params.name != undefined)
        {
            connection.get("SELECT * FROM Users WHERE name = ?", req.params.name)
            .then((datas) => {
                
                convertStrToArray(datas)
                res.json(datas)
            })
            .catch((e) => {
                res.status(500).send("Error DB ou, user non trouvé")
            })
        }
        else if(req.params.login != undefined)
        {
            connection.get("SELECT * FROM Users WHERE login = ?", req.params.login)
            .then((datas) => {
                
                convertStrToArray(datas)
                res.json(datas)
            })
            .catch((e) => {
                res.status(500).send("Error DB ou, user non trouvé")
            })
        }
        else {
            next()
        }

    })


    //localhost:3000/api/users/       --> post one user
    app.post("/api/users", (req, res, next) => {
    
        if(req.body.name && req.body.lastName && req.body.age && req.body.techFav && req.body.login)
        {
            let newUser = req.body
            newUser.techFav = newUser.techFav.toString()

            connection.run("INSERT INTO Users (name, lastName, login, age, techFav) VALUES (?,?,?,?,?)",
            newUser.name, newUser.lastName, newUser.login, newUser.age, newUser.techFav)
            .then((datas) => {
                console.log(datas)
                res.end()
            })
            .catch((e) => {
                res.status(500).send("Error lors de l'insertion du new user...")
            })
        }
        else{
            res.status("500").send("Objet User non conforme")
        }
    })



    //localhost:3000/api/users/:id     --> put / patch one user
    app.put("/api/users/:id", (req, res, next) => {

        if(parseInt(req.params.id), 10)
        {
            let id = parseInt(req.params.id, 10)

            if(req.body.name && req.body.lastName && req.body.age && req.body.techFav && req.body.login)
            {
                let updateUser = req.body
                updateUser.techFav = updateUser.techFav.toString()

                connection.run("UPDATE Users SET name=?, lastName=?, age=?, login=?, techFav=? WHERE id=?",
                updateUser.name, updateUser.lastName, updateUser.login, updateUser.age, updateUser.techFav, id)
                .then((datas) => {
                    console.log(datas)
                    res.end()
                })
                .catch((e) => {
                    res.status("500").send("User non trouvé / mis à jour")
                })
            }
            else{
                res.status("500").send("Objet User non conforme")
            }
        }
        else{
            res.status("500").send("ID User non conforme")
        }
    })



    //localhost:3000/api/users/:id     --> delete one user
    app.delete("/api/users/:id", (req, res, next) => {
        if(parseInt(req.params.id), 10)
        {
            let id = parseInt(req.params.id, 10)

            connection.run("DELETE FROM Users WHERE id=?", id)
            .then((datas) => {
                if(datas.changes == 0)
                    res.status(500).send("User non supprimé")
                else{
                    console.log(datas)
                    res.end()
                }
            })
            .catch((e) => {
                res.status(500).send("User non trouvé")
            })
        }
        else{
            res.status("500").send("ID User non conforme")
        }
    })




    app.all("*", (req, res) => {
        res.status("404").send("<h1>Erreur 404 : Page non trouvée</h1>")
    })


    /*
    Products
        localhost:3000/api/products/        --> get all
        localhost:3000/api/products/:id     --> get one by id
        localhost:3000/api/products/        --> post product
        localhost:3000/api/products/:id     --> put / patch product
        localhost:3000/api/products/:id     --> delete one product

        localhost:3000/api/prices/              --> get all
        localhost:3000/api/prices/:idProd       --> get one by id
        localhost:3000/api/prices/              --> post price
        localhost:3000/api/prices/:idProd       --> put / patch price on product
        localhost:3000/api/prices/:idProd       --> delete one price on product

        localhost:3000/api/categories/          --> get all
        localhost:3000/api/categories/:idProd   --> get one by id
        localhost:3000/api/categories/          --> post categories
        localhost:3000/api/categories/:idProd   --> put / patch categories on product
        localhost:3000/api/categories/:idProd   --> delete one categories on product


    */
})
.catch((e) => { console.log(e)})


app.listen(port, console.log(`Le serveur express écoute sur le port ${port}`))







function convertStrToArray(datas)
{
    if(typeof datas == Array)
    {
        return datas = datas.map((data) => {
            data.techFav = data.techFav.split(",")
            data.techFav = data.techFav.map((tech) => {
                return tech.trim()
            })
            return data
        })
    }
    else
    {
        datas.techFav = datas.techFav.split(",")
        datas.techFav = datas.techFav.map((tech) => {
            return tech.trim()
        })
        return datas
    }
    
}