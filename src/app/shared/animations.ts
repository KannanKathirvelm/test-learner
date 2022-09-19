import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations';
export const slideUpAnimation =
  trigger('slideUpAnimation', [
    transition(':enter', [
      style({ height: '0' }),
      animate('500ms', style({ height: '*' }))
    ]),
    transition(':leave', [
      animate('500ms', style({ height: '0' }))
    ])
  ]);


export const fadeUpAnimation = trigger('fadeUpAnimation', [
  transition(':enter', [
    style({ transform: 'translateY(400%)' }),
    animate('500ms ease-out', style({ transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('500ms ease-in', style({ transform: 'translateY(400%)' }))
  ])
]);

export const fadeSlowAnimation = trigger('fadeSlowAnimation', [
  transition(':enter', [
    style({ opacity: '0' }),
    animate('500ms 1000ms ease-out', style({ opacity: '1' }))
  ]),
  transition(':leave', [
    animate('500ms ease-in', style({ opacity: '0' }))
  ])
]);


export const alertFadeAnimation = trigger('alertFadeAnimation', [
  transition(':enter', [
    style({ opacity: '0' }),
    group([
      animate('500ms ease-out', style({ opacity: '1' })),
      query('@fadeUpAnimation, @fadeSlowAnimation', [
        animateChild()
      ])
    ])
  ]),
  transition(':leave', [
    group([
      animate('500ms ease-out', style({ opacity: '0' })),
      query('@fadeUpAnimation, @fadeSlowAnimation', [
        animateChild()
      ])
    ])
  ])
]);

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* => *', [
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    query(
      ':leave',
      [style({ opacity: 1 }), animate('1s', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(
      ':enter',
      [style({ opacity: 0 }), animate('1s', style({ opacity: 1 }))],
      { optional: true }
    )
  ])
]);
