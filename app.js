const express = require("express")
const Playlist = require("./models/playlist")
const Artist = require("./models/artist")
const Album = require("./models/album")
const Track = require("./models/track")
const Sequelize = require("sequelize")

const app = express()
//relationships
Artist.hasMany(Album,{
    foreignKey: 'ArtistId'
}) //Artist one to Many Album

Album.belongsTo(Artist,{
    foreignKey: 'ArtistId'
}) // album many to one artist

//many to many
Playlist.belongsToMany(Track,{
    through:'playlist_track',
    foreignKey: 'PlaylistId',
    timestamps: false
})


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

    Playlist.findByPk(id,{
        include: [Track] // playlist and track many to many relationship
    }).then((playlist)=>{
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

app.get("/api/albums/:id", function(request,response){
    let id = request.params.id

    Album.findByPk(id,{
        include: [Artist] // album many to one artist, we can add another relationships as well

    }).then((album)=>{
        if(album){
            response.json(album)
        } else {
            response.status(404).send()
        }
    })
})

app.listen(8000)