import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
     //TODO: create playlist
    try {
        const {name, description} = req.body
        const creator = req.user._id
        console
        const newPlaylist = await Playlist.create({
            name, 
            description,
            owner: creator,
            videos: []
        });
        res.status(201)
        .json(
            new ApiResponse(201, `${name} created`, newPlaylist)
        );    
    } catch (error) {
        console.log("Error creating playlist", error)
        res.status(500)
        .json(
            new ApiResponse(500, "Internal Error")
        );
    }

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    try {
        const {userId} = req.params

        if(!isValidObjectId(userId)){
            return res.status(400).json(
                {error: "Invalid User id"}
            )
        }
        
        //^ find playlists by specified userId
        const playlists = await Playlist.find({owner: userId})
        .select('name ,description, videos')
        //TODO .populate('vidoes, title') 
        
        // console.log("hehe")
        res.status(200).json(
            new ApiResponse(201, "Playlist retreived", playlists)
        )

    } catch (error) {
        console.log("Error during Playlist retreival");
        res.status(500).json(
            new ApiResponse(500, "Internal Server Error", error)
        );
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    console.log(req.params.playlistId)
    try {
        if(!isValidObjectId(playlistId)){
            return res.status(400).json({
                error: "Invalid Playlist Id"
            })
        }

        const playlist = await Playlist.findById(
            playlistId           
        )

        //^ check if playlist exists
        if(!playlist){
            return res.status(404).json(
                new ApiResponse(404, "Playlist not found")
            )
        }

        res.status(200).json(
            new ApiResponse(200, "playlist retreived", playlist)
        )


    } catch (error) {
        console.log("Error while retrieving playlist", error)
        res.status(500).json(
            new ApiResponse(500, "Internal server Error")
        )
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    try {
        if(!isValidObjectId(playlistId)){
            return res.status(400).json(
                new ApiResponse(401, "Invalid playlist Id")
            )
        }
        if(!isValidObjectId(videoId)){
            return res.status(400).json(
                new ApiResponse(401, "Invalid video Id")
            )
        }

        const playlist = await Playlist.findById({playlistId})
        if(!playlist){
            return res.status(404).json(
                new ApiResponse(404, "playlist not found")
            )
        }

        playlist.videos.push(videoId)
        await playlist.save()

        res.status(200).json(
            new ApiResponse(200, "Video added to the playlist successfully")
        )
    } catch (error) {
        console.log("error during adding video to playlist", error)
        res.status(500).json(
            new ApiResponse(500, "Internal server Error ")
        )
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    try {
        const {playlistId, videoId} = req.params

        if(!isValidObjectId(playlistId)){
            return res.status(400).json(
                new ApiResponse("invalid playlist Id")
            )
        }
        if(!isValidObjectId(videoId)){
            return res.status(400).json(
                new ApiResponse("invalid playlist Id")
            )
        }

        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json(
                new ApiResponse("No playlist found")
            )
        }

        const videoIndex = await Playlist.videos.indexOf(videoId);
        if(!videoIndex){
            return res.status(404).json(
                new ApiResponse("No video found")
            )
        }

        playlist.videos.splice(videoIndex, 1);
        await playlist.save();

        res.status(200).json(
            new ApiResponse(200, "Video removed from playlist successfully", playlist)
        )

    } catch (error) {
        console.log("Error while removing video from playlist")
        res.status(500).json(
            new ApiResponse(500, "Internal server Error", error)
        )
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params
    try {
        if(!isValidObjectId(playlistId)){
            return res.status(400).json(
                new ApiResponse(400, "Invalid playlist Id")
            )
        }
        const userId = req.user._id
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            return res.status(404).json(
                new ApiResponse(404, "Playlist not found")
            )
        }

        //^ check if authenticating user is owner or not
        if(playlist.owner.toString() !== userId.toString()){
            return res.status(403).json(
                new ApiResponse(403, "Unauthorized: you are not the owner of this playlist")
            )
        }

        //^ delete playlist
        await playlist.deleteOne()
        console.log(`Deleted playlist`)

        // await playlist.save()

        return res.status(200).json(
            new ApiResponse(200, "Playlist deleted successfully")
        )

    } catch (error) {
        console.log("Error while deleting playlist", error)
        res.status(500).json(
            new ApiResponse(500, "Internal server Error")
        )
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    const userId = req.user._id
    //TODO: update playlist

    try {
        if(!isValidObjectId(playlistId)){
            return res.status(404).json(
                new ApiResponse(404, "invalid playlist Id")
            )
        }

        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(400, "No playlist found")
        }

        //^ check if authenticating user is owner
        if(playlist.owner.toString() !== userId.toString()){
            return res.status(403).json(
                new ApiResponse(403, "Unauthorized: You are not the owner of the playlist")
            )
        }

        playlist.name = name;
        playlist.description = description;

        await playlist.save({validateBeforeSave : false}) 
        //^ even if the document has missing required fields or fields with values that do not meet the defined validation criteria

        return res.status(200).json(
            new ApiResponse(200, "Playlist Updated Successfully !")
        )

    } catch (error) {
        console.log("Error while updating playlist", error)
        return res.status(500).json(
            new ApiResponse(500, "Internal Server error")
        )
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}