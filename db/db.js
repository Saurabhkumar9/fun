const mongoose=require('mongoose')

const connection= async(req,res)=>{
    try {
        mongoose.connect(process.env.MONGO_URI)
          .then(() => console.log('MongoDB Connected'))
          
    } catch (error) {
        console.log(error)
    }
}
module.exports=connection