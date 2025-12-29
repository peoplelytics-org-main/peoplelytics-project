import { Schema, Document } from 'mongoose';

export interface ISalaryAndCompensation extends Document{
    salaryId:string;
    employeeId:string;
    name:string;
    salary:number;
    bonus:number;
    lastRaiseAmount?:number;
    lastRaiseDate?: Date;
}

export const SalaryAndCompensationSchema= new Schema <ISalaryAndCompensation>({
    salaryId: {
        type: String,
        required: true,
        unique: true,
        
    },
    employeeId: {
        type: String,
        ref:"employees",
        required: true,
        
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    salary: {
        type: Number,
        required: true,
        min: 0
    },
    lastRaiseDate:{
        type:Date
    },

    bonus: {
        type: Number,
        min: 0
    },
    lastRaiseAmount: {
        type: Number,
        min: 0
    },
},{
    timestamps: true,
    collection: 'salary_and_compensation'

})