/**
 * Server Configuration
 */

// Your desired port.
var serverPort = 8880; 

// Your Firebase Cloud Messaging Key (FCM).
var FCMId = 'AAAACLA0XxY:APA91bHMCIGmv4WY-jCHAjzi30DjKCvwhg88yqAE1WN0tAQMRPBz-yoFGUfBz78bXURljedk8VGmXbmkJReNn2exKHEjo38Dbn1XOX33PO6iTgCsZpUFD9espMsUuw1z4eC3pqGkBOQe';


/////////////////// Functions ///////////////////////

function getPort() {
    return serverPort;
}

function getFCM() {
    return FCMId;
}

module.exports = {
    getPort,
    getFCM
};