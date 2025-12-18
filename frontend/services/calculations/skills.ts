import type { Employee, SkillLevel, SkillGapData } from '../../types';
import { getEmployeeFlightRisk } from './turnover';

export type SkillMatrixData = Record<string, Record<SkillLevel | 'total', Employee[]>>;



export const getSkillMatrix = (employees: Employee[]): SkillMatrixData => {
    const matrix: SkillMatrixData = {};
    const uniqueLevels = new Set<string>();
    
    employees.filter(e => !e.terminationDate).forEach(emp => {
        if (!emp.skills || !Array.isArray(emp.skills)) {
            return;
        }
        
        emp.skills.forEach(skill => {
            if (!skill || !skill.name || !skill.level) {
                return;
            }
            
            uniqueLevels.add(skill.level);
            
            if (!matrix[skill.name]) {
                matrix[skill.name] = { 
                    Novice: [], 
                    Beginner: [], 
                    Competent: [], 
                    Proficient: [], 
                    Expert: [], 
                    total: [] 
                };
            }
            
            // Check if level exists in matrix before pushing
            if (!matrix[skill.name][skill.level]) {
                console.error(`❌ Unknown skill level: "${skill.level}" for skill: "${skill.name}" (Employee: ${emp.name})`);
                // Default to Competent
                matrix[skill.name].Competent.push(emp);
            } else {
                matrix[skill.name][skill.level].push(emp);
            }
            
            matrix[skill.name].total.push(emp);
        });
    });
    
    console.log('📊 Unique skill levels found:', Array.from(uniqueLevels));
    
    return matrix;
};

export const getSkillSetKPIs = (employees: Employee[], matrix: SkillMatrixData) => {
    const allSkills = Object.keys(matrix);
    if (allSkills.length === 0) {
        return { uniqueSkillCount: 0, mostCommonSkill: 'N/A', topExpertSkill: 'N/A', mostSkilledDepartment: 'N/A' };
    }
    const mostCommon = allSkills.sort((a, b) => matrix[b].total.length - matrix[a].total.length)[0] || 'N/A';
    const topExpert = allSkills.sort((a, b) => matrix[b].Expert.length - matrix[a].Expert.length)[0] || 'N/A';
    
    const deptSkills: Record<string, number> = {};
    employees.filter(e => !e.terminationDate).forEach(e => {
        deptSkills[e.department] = (deptSkills[e.department] || 0) + e.skills.length;
    });
    const mostSkilledDept = Object.entries(deptSkills).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { uniqueSkillCount: allSkills.length, mostCommonSkill: mostCommon, topExpertSkill: topExpert, mostSkilledDepartment: mostSkilledDept };
};

export const getAtRiskSkills = (employees: Employee[], threshold: number) => {
    const matrix = getSkillMatrix(employees);
    return Object.entries(matrix)
        .filter(([, data]) => data.total.length <= threshold)
        .map(([skillName, data]) => ({
            skillName,
            employees: data.total,
            highRiskEmployeeCount: data.total.filter(e => getEmployeeFlightRisk(e).risk === 'High').length,
        }))
        .sort((a, b) => a.employees.length - b.employees.length);
};

export const getSkillProficiencyMetrics = (employees: Employee[]) => {
    const skillLevels: Record<SkillLevel, number> = { Novice: 1, Beginner: 2, Competent: 3, Proficient: 4, Expert: 5 };
    const matrix = getSkillMatrix(employees);
    return Object.entries(matrix).map(([skillName, data]) => {
        if(data.total.length === 0) return { skillName, avgProficiency: 0 };
        const totalScore = data.total.reduce((acc, emp) => {
            const skill = emp.skills.find(s => s.name === skillName);
            return acc + (skill ? skillLevels[skill.level] : 0);
        }, 0);
        return { skillName, avgProficiency: totalScore / data.total.length };
    }).sort((a, b) => b.avgProficiency - a.avgProficiency);
};

export const getHighPerformerSkills = (employees: Employee[]) => {
    const highPerformers = employees.filter(e => e.performanceRating >= 4 && !e.terminationDate);
    const skillCounts: Record<string, number> = {};
    highPerformers.forEach(e => e.skills.forEach(s => skillCounts[s.name] = (skillCounts[s.name] || 0) + 1));
    return Object.entries(skillCounts).map(([skillName, count]) => ({ skillName, count }))
        .sort((a, b) => b.count - a.count);
};

export const getSkillComparisonByDepartment = (employees: Employee[]): {
    labels: string[]; // Skills
    datasets: {
        label: string; // Department
        data: number[]; // Avg proficiency for each skill
    }[];
} => {
    const activeEmployees = employees.filter(e => !e.terminationDate);
    if (activeEmployees.length === 0) return { labels: [], datasets: [] };

    const skillLevels: Record<SkillLevel, number> = { Novice: 1, Beginner: 2, Competent: 3, Proficient: 4, Expert: 5 };

    const totalSkillCounts: Record<string, number> = {};
    activeEmployees.forEach(emp => {
        emp.skills.forEach(skill => {
            totalSkillCounts[skill.name] = (totalSkillCounts[skill.name] || 0) + 1;
        });
    });
    const topSkills = Object.entries(totalSkillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);

    const deptCounts = activeEmployees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topDepartments = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0]);

    const proficiencyData: Record<string, Record<string, { totalScore: number, count: number }>> = {}; // { dept: { skill: { total, count } } }
    topDepartments.forEach(dept => {
        proficiencyData[dept] = {};
        topSkills.forEach(skill => {
            proficiencyData[dept][skill] = { totalScore: 0, count: 0 };
        });
    });

    activeEmployees.forEach(emp => {
        if (topDepartments.includes(emp.department)) {
            emp.skills.forEach(skill => {
                if (topSkills.includes(skill.name)) {
                    proficiencyData[emp.department][skill.name].totalScore += skillLevels[skill.level];
                    proficiencyData[emp.department][skill.name].count++;
                }
            });
        }
    });

    const datasets = topDepartments.map(dept => ({
        label: dept,
        data: topSkills.map(skill => {
            const { totalScore, count } = proficiencyData[dept][skill];
            return count > 0 ? totalScore / count : 0;
        })
    }));

    return { labels: topSkills, datasets };
};

export const getSkillImpactOnPerformance = (employees: Employee[], skill: string): { level: SkillLevel; avgPerformance: number; count: number }[] => {
    if (!skill) return [];
    const activeEmployees = employees.filter(e => !e.terminationDate);
    const skillLevels: SkillLevel[] = ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'];
    
    const dataByLevel: Record<SkillLevel, { totalPerf: number, count: number }> = {
        Novice: { totalPerf: 0, count: 0 },
        Beginner: { totalPerf: 0, count: 0 },
        Competent: { totalPerf: 0, count: 0 },
        Proficient: { totalPerf: 0, count: 0 },
        Expert: { totalPerf: 0, count: 0 },
    };

    activeEmployees.forEach(emp => {
        const empSkill = emp.skills.find(s => s.name === skill);
        if (empSkill) {
            dataByLevel[empSkill.level].totalPerf += emp.performanceRating;
            dataByLevel[empSkill.level].count++;
        }
    });

    return skillLevels.map(level => ({
        level,
        avgPerformance: dataByLevel[level].count > 0 ? dataByLevel[level].totalPerf / dataByLevel[level].count : 0,
        count: dataByLevel[level].count
    })).filter(d => d.count > 0);
};

export const getHighPerformerSkillsWithScarcity = (employees: Employee[]): { skillName: string, highPerformerCount: number, totalCount: number }[] => {
    const activeEmployees = employees.filter(e => !e.terminationDate);
    if (activeEmployees.length === 0) return [];
    
    const highPerformers = activeEmployees.filter(e => e.performanceRating >= 4);

    const highPerformerSkillCounts: Record<string, number> = {};
    highPerformers.forEach(e => {
        e.skills.forEach(s => {
            highPerformerSkillCounts[s.name] = (highPerformerSkillCounts[s.name] || 0) + 1;
        });
    });
    
    const totalSkillCounts: Record<string, number> = {};
    activeEmployees.forEach(e => {
        e.skills.forEach(s => {
            totalSkillCounts[s.name] = (totalSkillCounts[s.name] || 0) + 1;
        });
    });

    return Object.entries(highPerformerSkillCounts)
        .map(([skillName, highPerformerCount]) => ({
            skillName,
            highPerformerCount,
            totalCount: totalSkillCounts[skillName] || 0,
        }))
        .sort((a, b) => b.highPerformerCount - a.highPerformerCount);
};

export const getSkillDensityByDepartment = (employees: Employee[]): {
    skills: string[];
    departments: string[];
    datasets: { department: string; data: number[] }[];
    skillTotalCounts: Record<string, number>;
} => {
    const activeEmployees = employees.filter(e => !e.terminationDate);
    if (activeEmployees.length === 0) return { skills: [], departments: [], datasets: [], skillTotalCounts: {} };

    const totalSkillCounts: Record<string, number> = {};
    activeEmployees.forEach(emp => {
        emp.skills.forEach(skill => {
            totalSkillCounts[skill.name] = (totalSkillCounts[skill.name] || 0) + 1;
        });
    });
    const topSkills = Object.entries(totalSkillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // Top 10 skills
        .map(entry => entry[0]);

    const deptCounts = activeEmployees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topDepartments = Object.entries(deptCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 departments
        .map(entry => entry[0]);

    const skillDensity: Record<string, Record<string, number>> = {}; // { dept: { skill: count } }
    topDepartments.forEach(dept => {
        skillDensity[dept] = {};
        topSkills.forEach(skill => {
            skillDensity[dept][skill] = 0;
        });
    });

    activeEmployees.forEach(emp => {
        if (topDepartments.includes(emp.department)) {
            emp.skills.forEach(skill => {
                if (topSkills.includes(skill.name)) {
                    skillDensity[emp.department][skill.name]++;
                }
            });
        }
    });

    const datasets = topDepartments.map(dept => {
        const deptHeadcount = deptCounts[dept];
        return {
            department: dept,
            data: topSkills.map(skill => {
                const count = skillDensity[dept][skill] || 0;
                return deptHeadcount > 0 ? (count / deptHeadcount) * 100 : 0;
            })
        };
    });

    return {
        skills: topSkills,
        departments: topDepartments,
        datasets,
        skillTotalCounts: totalSkillCounts
    };
};

export const analyzeSkillGaps = (employees: Employee[], requiredSkillsText: string): SkillGapData[] => {
    const requiredMap = new Map<string, number>();
    requiredSkillsText.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length === 2) {
            const skillName = parts[0].trim();
            const count = parseInt(parts[1].trim(), 10);
            if (skillName && !isNaN(count)) {
                requiredMap.set(skillName, count);
            }
        }
    });

    const currentMap = new Map<string, number>();
    employees.filter(e => !e.terminationDate).forEach(emp => {
        emp.skills.forEach(skill => {
            if (skill.level === 'Proficient' || skill.level === 'Expert') {
                currentMap.set(skill.name, (currentMap.get(skill.name) || 0) + 1);
            }
        });
    });

    const allSkills = new Set([...requiredMap.keys(), ...currentMap.keys()]);

    return Array.from(allSkills).map(skillName => {
        const required = requiredMap.get(skillName) || 0;
        const current = currentMap.get(skillName) || 0;
        const gap = required - current;
        return { skillName, required, current, gap };
    }).sort((a, b) => a.gap - b.gap); // Sort by smallest gap first
};
