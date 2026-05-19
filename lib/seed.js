"use strict";
/**
 * Prisma-based seed script.
 * Run with:  npx ts-node --project tsconfig.json -e "import('./lib/seed').then(m => m.seedDatabase())"
 * Or via:   npx prisma db seed   (configure in package.json "prisma.seed")
 *
 * This seeds a minimal admin user and a handful of demo students so the
 * platform is usable immediately after a fresh database migration.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
var prisma_1 = require("./prisma");
var security_1 = require("./security");
var past = function (daysAgo) { return new Date(Date.now() - daysAgo * 86400000); };
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var adminHash, students, studentHash, _i, students_1, s;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, security_1.hashPassword)('Admin@123')];
                case 1:
                    adminHash = _a.sent();
                    return [4 /*yield*/, prisma_1.prisma.user.upsert({
                            where: { email: 'admin@ideaforge.dev' },
                            update: {},
                            create: {
                                id: 'admin-001',
                                email: 'admin@ideaforge.dev',
                                passwordHash: adminHash,
                                role: 'admin',
                                isVerified: true,
                                isBanned: false,
                                createdAt: past(120),
                                updatedAt: past(1),
                            },
                        })];
                case 2:
                    _a.sent();
                    students = [
                        { id: 's-001', name: 'Aryan Mehta', email: 'aryan@student.com', college: 'IIT Bombay', branch: 'CSE', year: 3 },
                        { id: 's-002', name: 'Priya Sharma', email: 'priya@student.com', college: 'NIT Trichy', branch: 'ECE', year: 2 },
                        { id: 's-003', name: 'Karan Patel', email: 'karan@student.com', college: 'BITS Pilani', branch: 'CS', year: 4 },
                    ];
                    return [4 /*yield*/, (0, security_1.hashPassword)('Student@123')];
                case 3:
                    studentHash = _a.sent();
                    _i = 0, students_1 = students;
                    _a.label = 4;
                case 4:
                    if (!(_i < students_1.length)) return [3 /*break*/, 7];
                    s = students_1[_i];
                    return [4 /*yield*/, prisma_1.prisma.user.upsert({
                            where: { email: s.email },
                            update: {},
                            create: {
                                id: s.id,
                                email: s.email,
                                passwordHash: studentHash,
                                role: 'student',
                                isVerified: true,
                                isBanned: false,
                                createdAt: past(90),
                                updatedAt: past(5),
                                studentProfile: {
                                    create: {
                                        name: s.name,
                                        avatar: "https://api.dicebear.com/8.x/initials/svg?seed=".concat(encodeURIComponent(s.name), "&backgroundColor=6366f1&textColor=ffffff"),
                                        college: s.college,
                                        branch: s.branch,
                                        year: s.year,
                                    },
                                },
                            },
                        })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    console.log('✅ Seed complete');
                    return [2 /*return*/];
            }
        });
    });
}
// Allow running directly: node -r ts-node/register lib/seed.ts
if (require.main === module) {
    seedDatabase()
        .catch(console.error)
        .finally(function () { return prisma_1.prisma.$disconnect(); });
}
