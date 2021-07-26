const express = require("express")
const bodyParser = require("body-parser")
const Playlist = require("./models/playlist")
const Artist = require("./models/artist")
const Album = require("./models/album")
const Track = require("./models/track")
const Sequelize = require("sequelize")

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

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

Track.belongsToMany(Playlist,{
    through:'playlist_track',
    foreignKey: 'TrackId',
    timestamps: false
})

app.delete("/api/playlists/:id", function(request,response){
    let {id} = request.params
    // Playlist table has relationships so we need to define also related path for cascade
    Playlist.findByPk(id).then((playlist)=>{
        if(playlist){
            return playlist.setTracks([]).then(()=>{
                return playlist.destroy()
            })
        } else {
            return Promise.reject()
        }
    })
    .then(()=>{
        response.status(204).send()
    },()=>{
        response.status(404).send()
    })
})

app.post('/api/artists',function(request,response){
    console.log(request.body.name)
    Artist.create({
        name: request.body.name,

    }).then((artist)=>{
        response.json(artist)
    },(validation)=>{
        response.status(422).json({
            errors: validation.errors.map((error)=>{
                return {
                    attiribute: error.path, // tell us what is failing
                    message: error.message
                }
            })})
    } )
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

app.get("/api/tracks/:id", function(request,response){
    let id = request.params.id

    Track.findByPk(id,{
        include: [Playlist] // playlist and track many to many relationship
    }).then((track)=>{
        if(track){
            response.json(track)
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