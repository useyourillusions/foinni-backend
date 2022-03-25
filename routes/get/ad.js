const Ad = require('../../database/models/Advertisement');
const User = require('../../database/models/User');
const Comment = require('../../database/models/Comment');
const responseSender = require('../../helpers/response-sender');

const extendCommentsWithAuthor = comments =>
    comments.map(async item => {
        const commentObj = item.toObject();

        try {
            const author = await User
                .findOne({_id: item.userId})
                .select('-_id -password -proofOfRefresh -__v');

            commentObj['author'] = author.toObject();

        } catch (err) {
            commentObj['author'] = null;
        }

        delete commentObj['userId'];

        return commentObj;
    });

const extendAdsWithAuthor = (allAuthors, knownAuthors) =>
    ad => {
        const adObj = ad.toObject();

        if (!knownAuthors[adObj.userId]) {
            const authorSoughtFor = allAuthors.filter(a => a._id.equals(adObj.userId));
            const authorObj = authorSoughtFor[0].toObject();

            delete authorObj._id;
            knownAuthors[adObj.userId] = authorObj;
            adObj['author'] = authorObj;

        } else {
            adObj['author'] = knownAuthors[adObj.userId];
        }

        return adObj;
    };

const addAuthors = async source => {
    const allAuthors = await User
        .find()
        .select('-password -proofOfRefresh -__v');
    const knownAuthors = {};

    if (source.length) {
        return source.map(extendAdsWithAuthor(allAuthors, knownAuthors));
    }
};


const adHandlerGet = async (req, res) => {
    if (req.query.id) {

        try {
            const singleAd = await Ad
                .findOneAndUpdate({_id: req.query.id}, { $inc: { views: 1 }})
                .select('-_id -userId -__v');

            singleAd['views'] += 1;

            const singleAdToSend = singleAd.toJSON();
            const relatedComments = await Comment
                .find({adId: req.query.id})
                .select('-adId -__v');

            singleAdToSend['comments'] = await Promise.all(
                extendCommentsWithAuthor(relatedComments)
            );

            res
                .status(200)
                .json(singleAdToSend);

        } catch (err) {
            responseSender(res, 404, 'Advertisement not found!');
        }

    } else {
        let adsToSend = await Ad
            .find()
            .select('-__v');

        adsToSend = await addAuthors(adsToSend);
        res
            .status(200)
            .json(adsToSend);
    }
};

module.exports = adHandlerGet;
