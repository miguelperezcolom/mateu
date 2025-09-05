package com.example.demo.infra.in.data;

public record Photo(
        String hostUrl,
        String originalImgPath,
        String makeName,
        String modelName,
        String modelMaskingName,
        String makeMaskingName,
        int isFuturistic
) {

    String fileName() {
        // https://imgd.aeplcdn.com/664x374/n/cw/ec/194921/escudo-exterior-right-front-three-quarter-26.jpeg?isig=0&q=80
        return originalImgPath.substring(originalImgPath.lastIndexOf("/") + 1, originalImgPath.indexOf("?"));
    }

    /*
    "hostUrl": "https://imgd.aeplcdn.com/",
        "originalImgPath": "https://imgd.aeplcdn.com/664x374/n/cw/ec/194921/escudo-exterior-right-front-three-quarter-26.jpeg?isig=0&q=80",
        "imageCount": 62,
        "galleryImagePath": "/n/cw/ec/209703/victoris-exterior-right-front-three-quarter.jpeg?isig=0",
        "makeId": 10,
        "modelId": 3165,
        "makeName": "Maruti Suzuki",
        "modelName": "Victoris",
        "modelMaskingName": "victoris",
        "isNew": 0,
        "isFuturistic": 1,
        "ReplaceModelInView": false,
        "ReplaceModel": null,
        "SeoText": null,
        "Is360Available": false,
        "threeSixtyPageUrl": null,
        "makeMaskingName": "maruti-suzuki"
     */
}
