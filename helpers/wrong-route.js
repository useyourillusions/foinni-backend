const wrongRouteHandler = (req, res) => {
    res
        .status(404)
        .json({
            code: 404,
            message: 'Resource not found...'
        });
};

module.exports = wrongRouteHandler;
