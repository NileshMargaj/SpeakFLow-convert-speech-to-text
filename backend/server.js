import app from './app.js'
const PORT = process.env.PORT || 3000
import connectDB from './config/db.js'


try {
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}...`)
    })
    connectDB()
} catch (error) {
    console.log('There is a error in connecting server', error.message)
}