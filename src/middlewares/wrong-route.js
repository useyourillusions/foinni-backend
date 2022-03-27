const wrongRouteHandler = (req, res) => {
    res
        .status(404)
        .json({
            code: 404,
            message: 'There is no the resource you looking for!'
        });
};

export { wrongRouteHandler };
