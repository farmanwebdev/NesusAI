import mongoose, { Document, Schema } from 'mongoose';

export type ContentType =
  | 'blog-post' | 'social-media' | 'email' | 'product-description'
  | 'ad-copy' | 'landing-page' | 'seo-content' | 'press-release';

export interface IGeneration extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: ContentType;
  prompt: string;
  result: string;
  tone: string;
  language: string;
  tokensUsed: number;
  model: string;
  isFavorited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GenerationSchema = new Schema<IGeneration>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['blog-post','social-media','email','product-description','ad-copy','landing-page','seo-content','press-release'],
      required: true,
    },
    prompt: { type: String, required: true, maxlength: 2000 },
    result: { type: String, required: true },
    tone: { type: String, default: 'professional' },
    language: { type: String, default: 'English' },
    tokensUsed: { type: Number, default: 0 },
    model: { type: String, default: 'gpt-4o' },
    isFavorited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IGeneration>('Generation', GenerationSchema);
