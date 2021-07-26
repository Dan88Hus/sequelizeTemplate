const express = require("express")
const Playlist = require("./models/playlist")
const Artist = require("./models/artist")
const Album = require("./models/album")
const Sequelize = require("sequelize")

const app = express()

Artist.hasMany(Album,{
    foreignKey: 'ArtistId'
}) //Artist one to Many Album

Album.belongsTo(Artist,{
    foreignKey: 'ArtistId'
}) // album many to one artist



app.get("/api/playlists", function(request,response){
    let filter = {}
    let q = request.query.q

    if (request.query.q){
        filter = {
            where: {
                name: {
                    [Sequelize.Op.like]: `${q}%` //like after q
                }
            }
        }
    }
    Playlist.findAll(filter).then((playlists)=>{
        response.json(playlists)
    })
})

app.get("/api/playlists/:id", function(request,response){
    let id = request.params.id

    Playlist.findByPk(id).then((playlist)=>{
        if(playlist){
            response.json(playlist)
        } else {
            response.status(404).send()
        }
    })
})

app.get("/api/artists/:id", function(request,response){
    let id = request.params.id

    Artist.findByPk(id,{
        include: [Album] // artists one tomany album 
    }).then((artist)=>{
        if(artist){
            response.json(artist)
        } else {
            response.status(404).send()
        }
    })
})

app.listen(8000)