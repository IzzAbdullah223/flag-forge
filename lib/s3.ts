import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function uploadAuditLogSnapshot(entry: {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  before: unknown;
  after: unknown;
  projectId: string;
  userId: string;
  createdAt: Date;
}) {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    console.warn("AWS_S3_BUCKET not set, skipping S3 audit log export");
    return;
  }

  const key = `audit-logs/${entry.projectId}/${entry.id}.json`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(entry, null, 2),
        ContentType: "application/json",
      })
    );
  } catch (err) {
 
    console.error("Failed to upload audit log to S3:", err);
  }
}