import { Component } from '@angular/core';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.component.html',
  styleUrls: ['./home-cliente.component.scss']
})
export class HomeClienteComponent {
  recommendedBook = {
    title: 'The Angular Guide',
    author: 'John Doe',
    price: '$19.99',
    image: 'assets/angular-guide.jpg',
  };

  popularBooks = [
    {
      title: 'Learning TypeScript',
      author: 'Jane Smith',
      rating: 4.5,
      image: 'assets/learning-ts.jpg',
    },
    {
      title: 'RxJS in Action',
      author: 'Mark Johnson',
      rating: 4.7,
      image: 'assets/rxjs.jpg',
    },
  ];

  bestsellingBooks = [
    {
      title: 'Mastering Angular',
      author: 'Emily Davis',
      rating: 4.9,
      image: 'assets/mastering-angular.jpg',
    },
    {
      title: 'Angular Patterns',
      author: 'Chris Lee',
      rating: 4.8,
      image: 'assets/angular-patterns.jpg',
    },
  ];

  newBooks = [
    {
      title: 'Angular 16 Features',
      rating: 4.6,
    },
    {
      title: 'Advanced Component Design',
      rating: 4.4,
    },
  ];
}
