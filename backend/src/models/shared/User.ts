import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'Super Admin' | 'Org Admin' | 'HR Analyst' | 'Executive';
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String, 
    required: true,
    minlength: 6,
    select:false
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Org Admin', 'HR Analyst', 'Executive'],
    required: true
  },
  organizationId: {
    type: String,
    sparse: true // Allows null values but creates index for non-null values
  },
  organizationName: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String
    }
  },
  permissions: [{
    type: String
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for better query performance
// Note: username and profile.email already have indexes from unique: true
// Note: organizationId already has index from sparse: true
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true
});

export const User = mongoose.model<IUser>('User', UserSchema);

