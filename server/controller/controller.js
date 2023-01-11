const model = require('../models/model') ;

// get categories

//post req on http://localhost:8000/api/categories 
async function create_Categories(req , res){
    // res.json("Get Request from Categories")

    const Create = new model.Categories({
        type:"Investment" ,
        color: "#FCBE44" , //dark
    })

    await Create.save(function(err){
        if(!err) return res.json(Create) ;

        return res.status(400).json({message: `Error while creating categories ${err}`}) ;
    });
}

//get req on http://localhost:8000/api/categories 
async function get_Categories(req , res){
    let data = await model.Categories.find({}) //this will return all the obj from the Categories collection 

    let filter = await data.map(v => Object.assign({} , {type: v.type , color: v.color})) ;

    // return res.json(data) ;
    return res.json(filter) ;
}

//post req on http://localhost:8000/api/transaction 
async function create_Transaction(req , res){
    //getting the data from the user and passing them as post req 

    if(!req.body) return res.status(400).json("Post HTTP Data not proovided") ;

    let {name , type , amount } = req.body ; //destructuring the body obj
    let color = '' ;

    if (type === 'Investment') color = '#FCBE44'
    else if(type == 'Expense') color = '#C43095'
    else color = '#1F3B5C' ;


    const create = await new model.Transaction(
        {
            // name: name 
            name ,
            type , 
            amount ,
            date: new Date() ,
            color 
        }
    );

    create.save(function(err){

        if(!err) return res.json(create) ;

        return res.status(400).json({message: `Error while creating transaction ${err}`}) ;
    })

}

//get req on http://localhost:8000/api/transaction 
async function get_Transaction(req , res){
    let data = await model.Transaction.find({}) ; //this will return all the data from the transaction collection

    return res.json(data) ;
}

//delete req on http://localhost:8000/api/transaction 
async function delete_Transaction(req , res){
    if(!req.body) return res.status(400).json({message: "Request body not found"}) ;
    await model.Transaction.deleteOne(req.body , function(err){
        if(!err) return res.json("Record Deleted...") ;
    }).clone().catch(function(err){
        return res.json("Error while deleting Transaction Record") ;
    })
}

//get req on http://localhost:8000/api/labels
async function get_Labels(req , res){
    model.Transaction.aggregate([
        {   
             //below key allows us to lookup for a specific field from the diff collection
            $lookup : {
                from: "categories" , //collection we want to join with
                localField: 'type' , //field we want to join by the local collection
                foreignField: "type" , //field we want to join by the foreign collection
                // as we have the type field in both transactions and categories models. Thus we link both the models using the same field 
                as: "categories_info" //name of the output array for the result 
            } 
        } ,
        {
            $unwind: "$categories_info" //this stmt will deconstruct the array field from the input doc to output doc for each elem 
        }
    ]).then(result => {
        let data = result.map(v=>Object.assign({} , {_id: v.id , name: v.name , type: v.type , amount: v.amount , color: v.categories_info['color']})) ;
        // res.json(result) ;
        res.json(data) ;
    }).catch(error => {
        res.status(400).json("Lookup Collection Error") ;
    })
} 

module.exports = {
    create_Categories ,
    get_Categories ,
    create_Transaction ,
    get_Transaction ,
    delete_Transaction ,
    get_Labels
}