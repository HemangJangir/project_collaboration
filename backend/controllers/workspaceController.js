// controllers/workspaceController.js - Controller functions for workspace routes
const Workspace = require("../models/Workspace");

/**
 * POST /api/workspaces/create
 * Create a new workspace. The authenticated user becomes the owner.
 * Body: { name, description }
 */
const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    // Create workspace with the authenticated user as owner + first member
    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || "",
      owner: req.user._id,
    });

    // Populate owner and members for the response
    const populated = await Workspace.findById(workspace._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(201).json(populated);
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    // Handle duplicate invite code (extremely rare, but safe)
    if (error.code === 11000) {
      return res.status(500).json({
        message: "Failed to generate unique code. Please try again.",
      });
    }
    next(error);
  }
};

/**
 * GET /api/workspaces/my
 * Get all workspaces the authenticated user belongs to (as owner or member).
 */
const getUserWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      members: req.user._id,
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ updatedAt: -1 }); // Most recently updated first

    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workspaces/:id
 * Get a single workspace by its ID. User must be a member.
 */
const getSingleWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if the requesting user is a member of this workspace
    const isMember = workspace.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    res.json(workspace);
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Workspace not found" });
    }
    next(error);
  }
};

/**
 * POST /api/workspaces/join
 * Join a workspace using its invite code.
 * Body: { inviteCode }
 */
const joinWorkspaceByCode = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode || inviteCode.trim().length === 0) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    // Find workspace by invite code (case-insensitive)
    const workspace = await Workspace.findOne({
      inviteCode: inviteCode.trim().toUpperCase(),
    });

    if (!workspace) {
      return res.status(404).json({ message: "Invalid invite code. No workspace found." });
    }

    // Check if user is already a member
    const alreadyMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      // Already a member — return the workspace anyway (idempotent)
      const populated = await Workspace.findById(workspace._id)
        .populate("owner", "name email")
        .populate("members", "name email");
      return res.json({
        ...populated.toObject(),
        alreadyMember: true,
        message: "You are already a member of this workspace",
      });
    }

    // Add user to members and save
    workspace.members.push(req.user._id);
    await workspace.save();

    const populated = await Workspace.findById(workspace._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getSingleWorkspace,
  joinWorkspaceByCode,
};