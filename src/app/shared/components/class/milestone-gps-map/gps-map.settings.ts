export const settings = {
  milestonePath: {
    strokeWidth: 12,
    strokeCap: 'round',
    strokeColor: new paper.Color('#0072bc'),
  },
  milestonePathAlter: {
    strokeWidth: 16,
    shadowBlur: 3,
    strokeCap: 'round',
    strokeColor: new paper.Color('#FFFFFF'),
    shadowColor: new paper.Color(0, 0, 0)
  },
  alternatePath: {
    strokeCap: 'round',
    dashArray: [5, 2],
    strokeColor: new paper.Color('#b8b8b8')
  },
  startPointCircle: {
    radius: 14,
    shadowBlur: 5,
    fillColor: new paper.Color(1, 1, 1),
    shadowColor: new paper.Color(0, 0, 0)
  },
  dataPointCircle: {
    radius: 14,
    shadowBlur: 5,
    strokeColor: new paper.Color('#0071bb'),
    fillColor: new paper.Color(1, 1, 1),
    shadowColor: new paper.Color(0, 0, 0)
  },
  innerDataPointCircle: {
    strokeColor: null,
    shadowBlur: 0,
    fillColor: new paper.Color('#0071bb')
  },
  dataPointTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    fillColor: new paper.Color('#a4a4a4')
  },
  resourceCircle: {
    fillColor: 'white',
    radius: 10,
    shadowColor: new paper.Color(0, 0, 0),
    shadowBlur: 3
  }
};
