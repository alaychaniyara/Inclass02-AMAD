const mongoose = require('mongoose');

const surveySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {type: String, required:true},
    answer1: {type:Number, default:0},//if no value is passed it will be defaulted to 0
    answer2: {type:Number, default:0},
    answer3: {type:Number, default:0},
    answer4: {type:Number, default:0},
    answer5: {type:Number, default:0},
    answer6: {type:Number, default:0},
    answer7: {type:Number, default:0},
    answer8: {type:Number, default:0},
    answer9: {type:Number, default:0},
    answer10: {type:Number, default:0},
    totalScore: {type:Number, default:0},
    riskLevel: {type:String}
});

module.exports = mongoose.model('Surveys', surveySchema);