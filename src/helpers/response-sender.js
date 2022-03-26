const responseSender = (res, code, message, content = null) => {

    const objToSend = {
        code,
        message
    };

    if (content) {
        objToSend['content'] = content;
    }

    res.status(code).json(objToSend);
};

module.exports = responseSender;
