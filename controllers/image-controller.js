const Image = require('../model/image');
const fs = require('fs');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelper');
const cloudinary = require('../config/cloudinary');
const uploadImageController = async(req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({
                success: false,
                message: 'Please upload a file. upload an image'
            });
        }

        //upload to cloudinary.
        const {url, publicId} = await uploadToCloudinary(req.file.path);

        //pass the above url and publicId to mongoDB
        const newlyUploadedImage = await Image.create({
            url: url,
            publicId: publicId,
            uploadedBy: req.userInfo.userId
        });
            fs.unlinkSync(req.file.path);
        if(!newlyUploadedImage){
            return res.status(400).json({
                success: false,
                message: 'Image upload failed'
            })
        }
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            image: newlyUploadedImage
        });
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
}


//get all images
const getAllImagesController = async(req, res) => {
    try {
        //sorting and pagination here:
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt';
        const sortedOrder = req.query.sortedOrder == 'asc' ? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages/limit);

        const sortObj = {};
        sortObj[sortBy] = sortedOrder;
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);


        //----------------------------------------------------
        //             [or]
        // const images = await Image.find({});
        //--------------------------------------------
        if(!images){
            return res.status(400).json({
                success: false,
                message: 'Cannot fetch all the images'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Fetched all the images',
            currentPage: page,
            totalPages: totalPages,
            totalImages: totalImages,
            images: images
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
};


//delete the images from database and cloudinary
const deleteImagesController = async(req, res) => {
    try {
        const getCurrentIdOfImageToBeDeleted = req.params.id;
        const userId = req.userInfo.userId;
        let image = await Image.findById(getCurrentIdOfImageToBeDeleted);
        //check image is uploaded by current user whio is trying to delete      
        if(image.uploadedBy.toString() !== userId){
            console.log(image.uploadedBy.toString(), userId)
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete the image because you have not uploaded it'
            })
        }

        image = await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);
        if(!image){
            return res.status(404).json({
                success: false,
                message: 'Image not Found'
            })
        }

        //delete the image from cloudinary 
        await cloudinary.uploader.destroy(image.publicId);
        await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);
        res.status(200).json({
            success: true,
            message: 'Image deleted Successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
}

module.exports = {uploadImageController, getAllImagesController, deleteImagesController};