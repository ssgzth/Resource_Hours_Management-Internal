export const data = {
  businessLines: [
    {
      name: "Software",
      employees: [
        {
          name: "Chetan",
          workHours: [
            {
              date: "2024-03-01",
              OH: 8,
              leave: 8,
              training: 8,
              holiday: 5,

              projects: [
                { projectName: "Project A", direct: 8 },
                { projectName: "Project B", direct: 4 },
              ],
            },
          ],
          forecastHours: [
            {
              date: "2024-03-08",
              OH: 8,
              leave: 8,
              training: 8,
              holiday: 5,

              projects: [
                { projectName: "Project A", direct: 8 },
                { projectName: "Project B", direct: 4 },
              ],
            },
            {
              date: "2024-03-15",
              OH: 6,
              leave: 5,
              training: 4,
              holiday: 5,
              projects: [{ projectName: "Project C", direct: 7 }],
            },
          ],
        },
        {
          name: "Amit",
          workHours: [
            {
              date: "2024-03-01",
              OH: 7,
              leave: 6,
              training: 5,
              holiday: 5,
              projects: [{ projectName: "Project A", direct: 9 }],
            },
          ],
          forecastHours: [
            {
              date: "2024-03-08",
              OH: 8,
              leave: 8,
              training: 8,
              holiday: 5,

              projects: [
                { projectName: "Project A", direct: 8 },
                { projectName: "Project B", direct: 4 },
              ],
            },
            {
              date: "2024-03-15",
              OH: 6,
              leave: 5,
              training: 4,
              holiday: 5,
              projects: [{ projectName: "Project C", direct: 7 }],
            },
          ],
        },
      ],
    },
  ],
};
