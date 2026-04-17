import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  usage: {
    chatMessages: number;
    contentGenerations: number;
    tokensUsed: number;
    resetDate: Date;
  };
  limits: {
    chatMessages: number;
    contentGenerations: number;
    tokensPerMonth: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: null },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    usage: {
      chatMessages: { type: Number, default: 0 },
      contentGenerations: { type: Number, default: 0 },
      tokensUsed: { type: Number, default: 0 },
      resetDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
    limits: {
      chatMessages: { type: Number, default: 50 },
      contentGenerations: { type: Number, default: 10 },
      tokensPerMonth: { type: Number, default: 50000 },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.pre('save', function (next) {
  if (this.isModified('plan')) {
    const planLimits = {
      free: { chatMessages: 50, contentGenerations: 10, tokensPerMonth: 50000 },
      pro: { chatMessages: 2000, contentGenerations: 500, tokensPerMonth: 2000000 },
      enterprise: { chatMessages: 999999, contentGenerations: 999999, tokensPerMonth: 999999999 },
    };
    this.limits = planLimits[this.plan];
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model<IUser>('User', UserSchema);
