const List = require("../models/listing");
module.exports.newForm = (req,res) =>{ 
    res.render("./listing/new.ejs");
}

module.exports.search =async (req, res,next) => {
    try {
        const { search } = req.query;
    
        if (!search) {
            return res.render("../listing/notfound.ejs");
        }
        const lists = await List.find({
            $or: [
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        });
        if (!lists || lists.length === 0) {
            return res.render("../listing/notfound.ejs");
        }
        res.render("./listing/index.ejs", { lists });

    } catch (err) {
        next( err);  
    }
}

module.exports.createList = async (req, res, next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(url, "    ", filename);

        const { title, price, location, country, description, image } = req.body;
        
        const lists = new List({
            title,
            description,
            price: parseInt(req.body.price, 10),
            image: { 
                filename: filename, 
                url: url 
            },
            location,
            country,
            user: req.user._id
        });

        await lists.save();
        
        req.flash("success", "Place published");
        res.redirect(`/${lists._id}`);
        
        console.log("Data saved:", lists);
    } catch (err) {
        console.log(err)
        next(err);
    }
}



module.exports.index = async (req,res) =>{
    const lists = await List.find();
    res.render("./listing/index.ejs",{lists});
}

module.exports.showRoute= async (req,res)=>{
    let {id} = req.params;
    const lists = await List.findById(id)
    .populate({
        path : "reviews",
        populate:
        {path : "user"},})
    .populate("user");
    console.log(lists)
    res.render("./listing/show.ejs" , {lists, apiKey: process.env.MAP_API_KEY});
}

module.exports.editPage = async(req,res,next)=>{
    try{let {id}=req.params;
    const q = await List.findById(id);
    res.render("./listing/edit.ejs",{q})
}catch(err){
    next(err)
}

};


module.exports.updateRoute = async (req, res, next) => {
    try {
        let { id } = req.params;
        
        // Extract other fields from req.body
        const { title, description, location, country } = req.body;
        
        if (typeof req.file !== "undefined") {
            // Case: New file is uploaded
            let url = req.file.path;
            let filename = req.file.filename;
            
            let q = await List.findByIdAndUpdate(id, {
                title,
                description,
                price: parseInt(req.body.price, 10),
                image: {
                    filename: filename,
                    url: url
                },
                location,
                country
            }, { runValidators: true, new: true });
            
            await q.save();
            console.log(q);
            req.flash("success", "place updated");
            return res.redirect("/");  // Add return here
        } else {
            
            let q = await List.findByIdAndUpdate(id, {
                title,
                description,
                price: parseInt(req.body.price, 10),
                location,
                country
            }, { runValidators: true, new: true });
            
            await q.save();
            req.flash("success", "place updated");
            return res.redirect("/");
        }
    } catch (err) {
        next(err);
    }
};

module.exports.destroyRoute =async (req,res,next)=>{

    try{
    let {id} = req.params;
    let q = await List.findByIdAndDelete(id);
    req.flash("Error" , "Deleted");
    res.redirect("/");
    
    }catch {
        next(err);
    }
}