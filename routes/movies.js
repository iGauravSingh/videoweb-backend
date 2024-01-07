const express = require('express')
const router = express.Router()
const {prisma} = require('../db')
const checkAuth = require('../middleware')
const fetchSubscription = require("../services/fetchSubscription")


router.get("/movies/list", checkAuth ,async (req,res)=> {

    /// stripe subscription

    const subscription = await fetchSubscription(req.user.email)
    
    if(!subscription){
        return res.status(403).json({
           errors: [
            {
                msg: "Unauthorized no plan"
            }
           ] 
        })
    }

    /// stripe


    const offset = parseInt(req.query.offset) ?  parseInt(req.query.offset) : 0;
    // const from = offset;
    // const to = from + 12;
    // const moviesSubset = [...movies].slice(from,to);
    // setTimeout(()=>{
    //     return res.send(moviesSubset)
    // },3000)
    const count = await prisma.movie.count()
    const movies = await prisma.movie.findMany({
        take: 12,
        skip: offset
    })
    return res.json(movies)
})

router.get("/movie/:id", checkAuth ,async (req,res)=> {



    const subscription = await fetchSubscription(req.user.email)
    
    if(!subscription){
        return res.status(403).json({
           errors: [
            {
                msg: "Unauthorized no plan"
            }
           ] 
        })
    }


    const id = req.params.id
    //const movie = movies.find(m => m.id === id)
    const movie = await prisma.movie.findUnique({
        where: {
           id: parseInt(id), 
        }
    })

    if(movie.title === "South Park" && subscription.name === "Basic Plan"){
        return res.status(403).json({
            errors: [
             {
                 msg: "Unauthorized need Premium Plan"
             }
            ] 
         })
    }
    return res.send(movie)
})

module.exports = router