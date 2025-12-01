import mongoose, { Schema, Document } from 'mongoose';

export interface ISkills extends Document {
  employeeId: string;
  employeeName:string;
  skillName: string;
  skillLevel: 'Novice' | 'Beginner' | 'Competent' | 'Proficient' | 'Expert';
  acquiredDate: Date;
  lastAssessed: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const SkillsSchema = new Schema<ISkills>({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  employeeName:{
    type:String,
    required:true,
    index:true,
  },
  skillName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  skillLevel: {
    type: String,
    enum: ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'],
    required: true,
    index: true
  },
  acquiredDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  lastAssessed: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'skills'
});

// Compound index to ensure unique skill per employee
SkillsSchema.index({ employeeId: 1, skillName: 1 }, { unique: true });

// Indexes for better query performance
SkillsSchema.index({ skillName: 1, skillLevel: 1 });
SkillsSchema.index({ employeeId: 1, isActive: 1 });
SkillsSchema.index({ skillLevel: 1, isActive: 1 });

//export const Skills = mongoose.model<ISkills>('Skills', SkillsSchema);

