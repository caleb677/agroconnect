// ─── SEED ACCOUNTS ───────────────────────────────────────────────
export const SEED_ACCOUNTS = [
  { role:"Farmer", email:"james@farm.ke", password:"farmer123", name:"James Mwangi", county:"Nakuru", phone:"0712 345 678" },
  { role:"Buyer", email:"fresh@mart.ke", password:"buyer123", name:"FreshMart Ltd", county:"Nairobi", phone:"0722 111 222" },
  { role:"Agrovet", email:"vet@agri.ke", password:"agrovet123", name:"AgriVet Plus", county:"Nakuru", phone:"0733 444 555" },
  { role:"Extension Officer", email:"otieno@ext.ke", password:"officer123", name:"Dr. Samuel Otieno", county:"Kisumu", phone:"0744 666 777" },
  { role:"Admin", email:"admin@agro.ke", password:"admin123", name:"Platform Admin", county:"Nairobi", phone:"0700 000 001" },
];


// ─── USER DATABASE USING LOCAL STORAGE ───────────────────────────
export const UserDB = {

  _profileCache:null,
  _seedPromise:null,


  async _loadProfiles(){

    if(this._profileCache !== null){
      return this._profileCache;
    }

    try{

      const data = localStorage.getItem("users:all");

      this._profileCache = data 
        ? JSON.parse(data)
        : {};

    }catch(error){

      console.error("Loading users failed",error);
      this._profileCache={};

    }

    return this._profileCache;

  },


  async _saveProfiles(){

    localStorage.setItem(
      "users:all",
      JSON.stringify(this._profileCache)
    );

  },


  async _load(){
    return this._loadProfiles();
  },


  get _cache(){
    return this._profileCache;
  },


// ─── CREATE DEFAULT USERS ────────────────────────────────────────

async seed(){

 if(this._seedPromise){
   return this._seedPromise;
 }


 this._seedPromise=(async()=>{

   const users=await this._loadProfiles();


   if(Object.keys(users).length>0){
      return;
   }


   SEED_ACCOUNTS.forEach(user=>{

     users[user.email]={
       ...user,
       joinedAt:"01 Jan 2026",
       certStatus:"approved",
       dashboardUnlocked:true,
       docsMeta:{}
     };

   });


   await this._saveProfiles();


 })();


 return this._seedPromise;

},


// ─── LOGIN ───────────────────────────────────────────────────────

async find(email,password){

 const users=await this._loadProfiles();

 const user=users[email];


 if(!user || user.password!==password){
    return null;
 }


 return user;

},



exists(email){

 if(!this._profileCache){
   return false;
 }


 return Object.prototype.hasOwnProperty.call(
   this._profileCache,
   email
 );

},



// ─── REGISTER USER ───────────────────────────────────────────────

async create(account){


 const users=await this._loadProfiles();


 users[account.email]={

   ...account,

   joinedAt:new Date().toLocaleDateString(
     "en-KE"
   ),

   certStatus:
     account.role==="Admin" ||
     account.role==="Extension Officer"
     ? "approved"
     : "none",


   dashboardUnlocked:
     account.role==="Admin" ||
     account.role==="Extension Officer" ||
     account.role==="Buyer",


   docsMeta:{}

 };


 await this._saveProfiles();


 return users[account.email];

},



// ─── UPDATE PROFILE ──────────────────────────────────────────────

async updateProfile(email,changes){

 const users=await this._loadProfiles();


 if(!users[email]){
    return false;
 }


 users[email]={
   ...users[email],
   ...changes
 };


 await this._saveProfiles();


 return users[email];

},



async updatePassword(email,password){

 return this.updateProfile(
   email,
   {
    password
   }
 );

},



// ─── ADMIN USERS LIST ────────────────────────────────────────────

async listAll(){

 const users=await this._loadProfiles();


 return Object.values(users).map(user=>({

   ...user,

   password:"••••••••"

 }));

},



// ─── DOCUMENT STORAGE ───────────────────────────────────────────

async saveDoc(email,key,data){

 try{

   localStorage.setItem(
     `doc:${email}:${key}`,
     data
   );


   await this.updateProfile(
     email,
     {
       docsMeta:{
        ...(this._profileCache[email]?.docsMeta||{}),
        [key]:{
          uploaded:true,
          savedAt:new Date().toISOString()
        }
       }
     }
   );


   return true;


 }catch(error){

   console.error(error);
   return false;

 }

},



async loadDoc(email,key){

 try{

   return localStorage.getItem(
     `doc:${email}:${key}`
   );


 }catch{

   return null;

 }

},




async loadAllDocs(email){

 const files=[
 "nationalId",
 "farmPhoto",
 "trainingCert",
 "soilReport",
 "profilePhoto"
 ];


 const result={};


 files.forEach(file=>{

   result[file]=this.loadDoc(
     email,
     file
   );

 });


 return result;

},




// ─── CERTIFICATION ───────────────────────────────────────────────

async saveCert(email,data){

 localStorage.setItem(
   `cert:${email}`,
   JSON.stringify(data)
 );


 return true;

},



async loadCert(email){

 const data=localStorage.getItem(
   `cert:${email}`
 );


 return data
 ? JSON.parse(data)
 : null;

},



async getProfile(email){

 const users=await this._loadProfiles();


 if(!users[email]){
    return null;
 }


 return {

   ...users[email],

   cert:
    await this.loadCert(email)

 };

}



};



// ─── MURANG'A HIERARCHY ─────────────────────────────────────────

export const MURANGA_SUBCOUNTIES=[
 "Kandara",
 "Gatanga",
 "Kigumo",
 "Kiharu",
 "Mathioya",
 "Kahuro",
 "Murang'a South"
];


export const SUBCOUNTY_FIELD={
 key:"county",
 label:"Sub-County (Murang'a)",
 type:"select",
 options:MURANGA_SUBCOUNTIES
};