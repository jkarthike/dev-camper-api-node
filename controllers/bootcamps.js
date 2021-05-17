const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

/*
@desc      Get all bootcamps
@route     GET /api/v1/bootcamps
@access    Public
*/
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    // Send response data
    res.status(200).json(res.advancedResults);
});

/*
@desc      Get Single bootcamp
@route     GET /api/v1/bootcamps/:id
@access    Public
*/
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }
    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

/*
@desc      Create a new bootcamp
@route     POST /api/v1/bootcamps/
@access    Private
*/
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

/*
@desc      Update a  bootcamp
@route     PUT /api/v1/bootcamps/:id
@access    Private
*/
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }
    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

/*
@desc      Delete a  bootcamp
@route     DELETE /api/v1/bootcamps/:id
@access    Private
*/
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404
            )
        );
    }
    bootcamp.remove();
    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

/*
@desc      Get bootcamps within a radius
@route     DELETE /api/v1/bootcamps/radius/:zipcode/:distance
@access    Private
*/
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat and long from geocode
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of earth
    // Earth radius = 3,963 mi or 6378 km
    const radius = distance / 6378;
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius],
            },
        },
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});

/*
@desc      Upload photo for bootcamp
@route     PUT /api/v1/bootcamps/:id/photo
@access    Private
*/
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                400
            )
        );
    }
    if (!req.files) {
        return next(new ErrorResponse(`Please upload a photo`, 400));
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload a image file`, 400));
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload a image file less than ${process.env.MAX_FILE_UPLOAD}`,
                400
            )
        );
    }

    // Create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name,
        });
    });

    console.log(file.name);
});
